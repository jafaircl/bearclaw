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

export const STRING_TYPE = primitiveType(Type_PrimitiveType.STRING);

export function isStringType(val: Type): val is Type & {
  typeKind: { case: 'primitive'; value: Type_PrimitiveType };
} {
  return (
    val.typeKind.case === 'primitive' &&
    val.typeKind.value === Type_PrimitiveType.STRING
  );
}

export function unwrapStringType(val: Type) {
  if (isStringType(val)) {
    return val.typeKind.value;
  }
  return null;
}

export function stringConstant(value: string) {
  return create(ConstantSchema, {
    constantKind: {
      case: 'stringValue',
      value,
    },
  });
}

export function isStringConstant(constant: Constant): constant is Constant & {
  constantKind: { case: 'stringValue'; value: string };
} {
  return constant.constantKind.case === 'stringValue';
}

export function stringExpr(id: bigint, value: string) {
  return create(ExprSchema, {
    id,
    exprKind: {
      case: 'constExpr',
      value: stringConstant(value),
    },
  });
}

export function isStringExpr(expr: Expr): expr is Expr & {
  exprKind: {
    case: 'constExpr';
    value: Constant & {
      constantKind: { case: 'stringValue'; value: string };
    };
  };
} {
  return isConstExpr(expr) && isStringConstant(expr.exprKind.value);
}

export function stringValue(value: string) {
  return create(ValueSchema, {
    kind: {
      case: 'stringValue',
      value,
    },
  });
}

export function isStringValue(value: Value): value is Value & {
  kind: { case: 'stringValue'; value: string };
} {
  return value.kind.case === 'stringValue';
}
