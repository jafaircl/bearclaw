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
import { primitiveType } from './primitive';

export const DOUBLE_TYPE = primitiveType(Type_PrimitiveType.DOUBLE);

export function isDoubleType(val: Type): val is Type & {
  typeKind: { case: 'primitive'; value: Type_PrimitiveType.DOUBLE };
} {
  return (
    val.typeKind.case === 'primitive' &&
    val.typeKind.value === Type_PrimitiveType.DOUBLE
  );
}

export function unwrapDoubleType(val: Type) {
  if (isDoubleType(val)) {
    return val.typeKind.value;
  }
  return null;
}

export function doubleConstant(value: number) {
  return create(ConstantSchema, {
    constantKind: {
      case: 'doubleValue',
      value,
    },
  });
}

export function isDoubleConstant(constant: Constant): constant is Constant & {
  constantKind: { case: 'doubleValue'; value: number };
} {
  return constant.constantKind.case === 'doubleValue';
}

export function doubleExpr(id: bigint, value: number) {
  return create(ExprSchema, {
    id,
    exprKind: {
      case: 'constExpr',
      value: doubleConstant(value),
    },
  });
}

export function isDoubleExpr(expr: Expr): expr is Expr & {
  exprKind: {
    case: 'constExpr';
    value: Constant & {
      constantKind: { case: 'doubleValue'; value: number };
    };
  };
} {
  return (
    expr.exprKind.case === 'constExpr' && isDoubleConstant(expr.exprKind.value)
  );
}

export function doubleValue(value: number) {
  return create(ValueSchema, {
    kind: {
      case: 'doubleValue',
      value,
    },
  });
}

export function isDoubleValue(value: Value): value is Value & {
  kind: { case: 'doubleValue'; value: number };
} {
  return value.kind.case === 'doubleValue';
}
