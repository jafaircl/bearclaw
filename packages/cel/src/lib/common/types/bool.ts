import {
  Type,
  Type_PrimitiveType,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb.js';
import {
  Constant,
  ConstantSchema,
  Expr,
  ExprSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';
import {
  Value,
  ValueSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb.js';
import { create } from '@bufbuild/protobuf';
import { isConstExpr } from './constant';
import { primitiveType } from './primitive';

export const BOOL_TYPE = primitiveType(Type_PrimitiveType.BOOL);

export function isBoolType(type: Type) {
  return (
    type.typeKind.case === 'primitive' &&
    type.typeKind.value === Type_PrimitiveType.BOOL
  );
}

export function boolConstant(value: boolean) {
  return create(ConstantSchema, {
    constantKind: {
      case: 'boolValue',
      value,
    },
  });
}

export function isBoolConstant(constant: Constant): constant is Constant & {
  constantKind: { case: 'boolValue'; value: boolean };
} {
  return constant.constantKind.case === 'boolValue';
}

export function boolExpr(id: bigint, value: boolean) {
  return create(ExprSchema, {
    id,
    exprKind: {
      case: 'constExpr',
      value: boolConstant(value),
    },
  });
}

export function isBoolExpr(expr: Expr): expr is Expr & {
  exprKind: {
    case: 'constExpr';
    value: Constant & { constantKind: { case: 'boolValue'; value: boolean } };
  };
} {
  return isConstExpr(expr) && isBoolConstant(expr.exprKind.value);
}

export function boolValue(value: boolean) {
  return create(ValueSchema, {
    kind: {
      case: 'boolValue',
      value,
    },
  });
}

export function isBoolValue(value: Value): value is Value & {
  kind: { case: 'boolValue'; value: boolean };
} {
  return value.kind.case === 'boolValue';
}
