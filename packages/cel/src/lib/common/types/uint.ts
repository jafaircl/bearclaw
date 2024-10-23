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

export const UINT64_TYPE = primitiveType(Type_PrimitiveType.UINT64);

export function isUint64Type(type: Type): type is Type & {
  typeKind: { case: 'primitive'; value: Type_PrimitiveType };
} {
  return (
    type.typeKind.case === 'primitive' &&
    type.typeKind.value === Type_PrimitiveType.UINT64
  );
}

export function unwrapUnit64Type(type: Type) {
  if (isUint64Type(type)) {
    return type.typeKind.value;
  }
  return null;
}

export function uint64Constant(value: bigint) {
  return create(ConstantSchema, {
    constantKind: {
      case: 'uint64Value',
      value,
    },
  });
}

export function isUint64Constant(constant: Constant): constant is Constant & {
  constantKind: { case: 'uint64Value'; value: bigint };
} {
  return constant.constantKind.case === 'uint64Value';
}

export function uint64Expr(id: bigint, value: bigint) {
  return create(ExprSchema, {
    id,
    exprKind: {
      case: 'constExpr',
      value: uint64Constant(value),
    },
  });
}

export function isUint64Expr(expr: Expr): expr is Expr & {
  exprKind: {
    case: 'constExpr';
    value: Constant & { constantKind: { case: 'uint64Value'; value: bigint } };
  };
} {
  return isConstExpr(expr) && isUint64Constant(expr.exprKind.value);
}

export function uint64Value(value: bigint) {
  return create(ValueSchema, {
    kind: {
      case: 'uint64Value',
      value,
    },
  });
}

export function isUint64Value(value: Value): value is Value & {
  kind: { case: 'uint64Value'; value: bigint };
} {
  return value.kind.case === 'uint64Value';
}
