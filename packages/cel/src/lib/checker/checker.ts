/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { isNil } from '@bearclaw/is';
import { Type as ProtoType } from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb.js';
import { Expr } from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb';
import { Errors } from '../common/errors';
import { protoConstantToType } from '../common/pb/constants';
import {
  unwrapConstantExpr,
  unwrapIdentProtoExpr,
} from '../common/pb/expressions';
import {
  AST,
  CheckedAST,
  newIdentReference,
  ReferenceInfo,
} from './../common/ast';
import { ErrorType, Type, typeToExprType } from './../common/types/types';
import { AggregateLiteralElementType, Env } from './env';
import { Mapping } from './mapping';
import { substitute } from './types';

export class Checker {
  #ast: AST;
  #env: Env;
  #errors: Errors;
  #mapping: Mapping;
  #typeMap = new Map<bigint, Type>();
  #refMap = new Map<bigint, ReferenceInfo>();

  constructor(ast: AST, env: Env) {
    this.#ast = ast;
    this.#env = env;
    this.#errors = new Errors(ast.sourceInfo().source());
    this.#mapping = new Mapping();
  }

  public get errors() {
    return this.#errors;
  }

  dynAggregateLiteralElementTypesEnabled() {
    return (
      this.#env.aggLitElemType === AggregateLiteralElementType.DYN_ELEMENT_TYPE
    );
  }

  check(): CheckedAST {
    this.checkExpr();

    // Walk over the final type map substituting any type parameters either by
    // their bound value or by DYN.
    for (const [id, type] of this.#typeMap) {
      this.#typeMap.set(id, substitute(this.#mapping, type, true));
    }
    return new CheckedAST(this.#ast, this.#typeMap, this.#refMap);
  }

  checkExpr() {
    const expr = this.#ast.expr();
    switch (expr.exprKind.case) {
      case 'constExpr':
        return this.checkConstExpr(expr);
      case 'identExpr':
        return this.checkIdentExpr(expr);
      default:
        this.#errors.reportInternalError('unexpected expr kind');
        break;
    }
  }

  checkConstExpr(expr: Expr) {
    const constant = unwrapConstantExpr(expr);
    if (isNil(constant)) {
      this.#errors.reportInternalError(
        `expected constant expression, got ${expr.exprKind.case}`
      );
      return;
    }
    const type = protoConstantToType(constant);
    this.setType(expr, type);
  }

  checkIdentExpr(expr: Expr) {
    const exprIdent = unwrapIdentProtoExpr(expr);
    if (isNil(exprIdent)) {
      this.#errors.reportInternalError(
        `expected ident expression, got ${expr.exprKind.case}`
      );
      return;
    }
    // Check to see if the identifier is declared.
    const ident = this.#env.lookupIdent(exprIdent.name);
    if (!isNil(ident)) {
      this.setType(expr, ident.type());
      this.setReference(expr, newIdentReference(ident.name(), ident.value()));
      // Overwrite the identifier with its fully qualified name.
      // e.SetKindCase(c.NewIdent(e.ID(), ident.Name()));
      return;
    }
    this.setType(expr, ErrorType);
    this.#errors.reportUndeclaredReference(
      expr.id,
      this.location(expr),
      this.#env.container,
      exprIdent.name
    );
  }

  location(expr: Expr) {
    return this.locationByID(expr.id);
  }

  locationByID(id: bigint) {
    return this.#ast.sourceInfo().getStartLocation(id);
  }

  setType(expr: Expr, t: Type) {
    const found = this.getType(expr);
    if (!isNil(found) && !t.isExactType(found)) {
      this.#errors.reportIncompatibleTypes(
        expr.id,
        this.location(expr),
        expr,
        found,
        t
      );
    }
    this.#typeMap.set(expr.id, t);
  }

  getType(expr: Expr): Type | null {
    return this.#typeMap.get(expr.id) ?? null;
  }

  setReference(expr: Expr, ref: ReferenceInfo) {
    const found = this.getReference(expr);
    if (!isNil(found) && !found.equals(ref)) {
      this.#errors.reportReferenceRedefinition(
        expr.id,
        this.location(expr),
        expr,
        found,
        ref
      );
    }
    this.#refMap.set(expr.id, ref);
  }

  getReference(expr: Expr): ReferenceInfo | null {
    return this.#refMap.get(expr.id) ?? null;
  }
}

function typeMapToProto(typeMap: Map<bigint, Type>): Record<string, ProtoType> {
  const result: Record<string, ProtoType> = {};
  for (const [id, type] of typeMap) {
    const t = typeToExprType(type);
    if (t instanceof Error) {
      throw t;
    }
    result[id.toString()] = t;
  }
  return result;
}
