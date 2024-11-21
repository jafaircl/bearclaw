/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { isNil } from '@bearclaw/is';
import {
  CheckedExpr,
  CheckedExprSchema,
  Type as ProtoType,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb.js';
import {
  Expr,
  ParsedExpr,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb';
import { create } from '@bufbuild/protobuf';
import { Errors } from '../common/errors';
import { InfoSource, Source } from '../common/source';
import { newSourceInfo, ReferenceInfo, SourceInfo } from './../common/ast';
import { Type, typeToExprType } from './../common/types/types';
import { AggregateLiteralElementType, Env } from './env';
import { Mapping } from './mapping';
import { substitute } from './types';

export class Checker {
  #parsed: ParsedExpr;
  #source: Source;
  #sourceInfo: SourceInfo;
  #env: Env;
  #errors: Errors;
  #mapping: Mapping;
  #typeMap = new Map<bigint, Type>();
  #refMap = new Map<bigint, ReferenceInfo>();

  constructor(expr: ParsedExpr, env: Env) {
    this.#parsed = expr;
    this.#source = new InfoSource(expr.sourceInfo);
    this.#sourceInfo = newSourceInfo(this.#source);
    this.#env = env;
    this.#errors = new Errors(this.#source);
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

  check(): CheckedExpr {
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
    return create(CheckedExprSchema, {
      expr: this.#parsed.expr,
      sourceInfo: this.#sourceInfo.toProto(),
      typeMap: typeMapToProto(this.#typeMap),
      // TODO: other keys
    });
  }

  location(expr: Expr) {
    return this.locationByID(expr.id);
  }

  locationByID(id: bigint) {
    return this.#sourceInfo.getStartLocation(id);
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
