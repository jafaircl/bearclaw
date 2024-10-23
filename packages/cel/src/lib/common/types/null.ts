import {
  Type,
  TypeSchema,
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
import { NullValue } from '@bufbuild/protobuf/wkt';
import { isConstExpr } from './constant';

export const NULL_TYPE = create(TypeSchema, {
  typeKind: {
    case: 'null',
    value: NullValue.NULL_VALUE,
  },
});

export function isNullType(type: Type): type is Type & {
  typeKind: { case: 'null'; value: NullValue };
} {
  return type.typeKind.case === 'null';
}

export function unwrapNullType(type: Type) {
  if (isNullType(type)) {
    return type.typeKind.value;
  }
  return null;
}

export const NULL_CONSTANT = create(ConstantSchema, {
  constantKind: {
    case: 'nullValue',
    value: NullValue.NULL_VALUE,
  },
});

export function isNullConstant(constant: Constant): constant is Constant & {
  constantKind: { case: 'nullValue'; value: NullValue.NULL_VALUE };
} {
  return constant.constantKind.case === 'nullValue';
}

export function nullExpr(id: bigint) {
  return create(ExprSchema, {
    id,
    exprKind: {
      case: 'constExpr',
      value: NULL_CONSTANT,
    },
  });
}

export function isNullExpr(expr: Expr): expr is Expr & {
  exprKind: {
    case: 'constExpr';
    value: Constant & {
      constantKind: { case: 'nullValue'; value: NullValue.NULL_VALUE };
    };
  };
} {
  return isConstExpr(expr) && isNullConstant(expr.exprKind.value);
}

export const NULL_VALUE = create(ValueSchema, {
  kind: {
    case: 'nullValue',
    value: NullValue.NULL_VALUE,
  },
});

export function isNullValue(value: Value): value is Value & {
  kind: { case: 'nullValue'; value: NullValue.NULL_VALUE };
} {
  return value.kind.case === 'nullValue';
}
