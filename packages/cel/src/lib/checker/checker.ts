/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { isNil } from '@bearclaw/is';
import { Type as ProtoType } from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb.js';
import { Expr } from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb';
import { Errors } from '../common/errors';
import { AST, CheckedAST, ReferenceInfo } from './../common/ast';
import { Type, typeToExprType } from './../common/types/types';
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
    // const expr = this.#parsed.expr!;
    // switch (expr.exprKind.case) {
    //   case 'constExpr':
    //     this.setType(expr.exprKind.value);
    //   default:
    //     throw new Error('unexpected expr kind');
    // }
    // Walk over the final type map substituting any type parameters either by
    // their bound value or by DYN.
    for (const [id, type] of this.#typeMap) {
      this.#typeMap.set(id, substitute(this.#mapping, type, true));
    }
    return new CheckedAST(this.#ast, this.#typeMap, this.#refMap);
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
