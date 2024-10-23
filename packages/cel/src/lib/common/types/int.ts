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

export const INT64_TYPE = primitiveType(Type_PrimitiveType.INT64);

export function isInt64Type(val: Type): val is Type & {
  typeKind: { case: 'primitive'; value: Type_PrimitiveType.INT64 };
} {
  return (
    val.typeKind.case === 'primitive' &&
    val.typeKind.value === Type_PrimitiveType.INT64
  );
}

export function unwrapInt64Type(val: Type) {
  if (isInt64Type(val)) {
    return val.typeKind.value;
  }
  return null;
}

export function int64Constant(value: bigint) {
  return create(ConstantSchema, {
    constantKind: {
      case: 'int64Value',
      value,
    },
  });
}

export function isInt64Constant(constant: Constant): constant is Constant & {
  constantKind: { case: 'int64Value'; value: bigint };
} {
  return constant.constantKind.case === 'int64Value';
}

export function int64Expr(id: bigint, value: bigint) {
  return create(ExprSchema, {
    id,
    exprKind: {
      case: 'constExpr',
      value: int64Constant(value),
    },
  });
}

export function isInt64Expr(expr: Expr): expr is Expr & {
  exprKind: {
    case: 'constExpr';
    value: Constant & { constantKind: { case: 'int64Value'; value: bigint } };
  };
} {
  return isConstExpr(expr) && isInt64Constant(expr.exprKind.value);
}

export function int64Value(value: bigint) {
  return create(ValueSchema, {
    kind: {
      case: 'int64Value',
      value,
    },
  });
}

export function isInt64Value(value: Value): value is Value & {
  kind: { case: 'int64Value'; value: bigint };
} {
  return value.kind.case === 'int64Value';
}
