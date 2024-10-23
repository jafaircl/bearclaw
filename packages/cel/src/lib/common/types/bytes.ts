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

export const BYTES_TYPE = primitiveType(Type_PrimitiveType.BYTES);

export function isBytesType(val: Type) {
  return (
    val.typeKind.case === 'primitive' &&
    val.typeKind.value === Type_PrimitiveType.BYTES
  );
}

export function bytesConstant(value: Uint8Array) {
  return create(ConstantSchema, {
    constantKind: {
      case: 'bytesValue',
      value,
    },
  });
}

export function isBytesConstant(constant: Constant): constant is Constant & {
  constantKind: { case: 'bytesValue'; value: Uint8Array };
} {
  return constant.constantKind.case === 'bytesValue';
}

export function bytesExpr(id: bigint, value: Uint8Array) {
  return create(ExprSchema, {
    id,
    exprKind: {
      case: 'constExpr',
      value: bytesConstant(value),
    },
  });
}

export function isBytesExpr(expr: Expr): expr is Expr & {
  exprKind: {
    case: 'constExpr';
    value: Constant & {
      constantKind: { case: 'bytesValue'; value: Uint8Array };
    };
  };
} {
  return isConstExpr(expr) && isBytesConstant(expr.exprKind.value);
}

export function bytesValue(value: Uint8Array) {
  return create(ValueSchema, {
    kind: {
      case: 'bytesValue',
      value,
    },
  });
}

export function isBytesValue(value: Value): value is Value & {
  kind: { case: 'bytesValue'; value: Uint8Array };
} {
  return value.kind.case === 'bytesValue';
}
