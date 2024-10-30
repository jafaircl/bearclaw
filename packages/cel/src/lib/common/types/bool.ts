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
import { AnySchema, BoolValueSchema, anyPack } from '@bufbuild/protobuf/wkt';
import { formatCELType } from '../format';
import { isConstExpr } from './constant';
import { int64Value } from './int';
import { NativeType } from './native';
import { primitiveType } from './primitive';
import { stringValue } from './string';
import { Trait } from './traits/trait';

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

export function convertBoolValueToNative(value: Value, type: NativeType) {
  if (!isBoolValue(value)) {
    // This should never happen
    throw new Error('value is not a bool');
  }
  switch (type) {
    case Boolean:
      return value.kind.value;
    case AnySchema:
      return anyPack(
        BoolValueSchema,
        create(BoolValueSchema, { value: value.kind.value })
      );
    case BoolValueSchema:
      return create(BoolValueSchema, { value: value.kind.value });
    default:
      break;
  }
  return new Error(
    `type conversion error from '${formatCELType(BOOL_TYPE)}' to '${type.name}'`
  );
}

export function convertBoolValueToType(value: Value, type: Type) {
  if (!isBoolValue(value)) {
    // This should never happen
    throw new Error('value is not a bool');
  }
  switch (type.typeKind.case) {
    case 'primitive':
      switch (type.typeKind.value) {
        case Type_PrimitiveType.BOOL:
          return boolValue(value.kind.value);
        case Type_PrimitiveType.STRING:
          return stringValue(value.kind.value ? 'true' : 'false');
        default:
          break;
      }
      break;
    case 'type':
      return BOOL_TYPE;
    default:
      break;
  }
  return new Error(
    `type conversion error from '${formatCELType(
      BOOL_TYPE
    )}' to '${formatCELType(type)}'`
  );
}

export function equalBoolValue(value: Value, other: Value) {
  if (!isBoolValue(value)) {
    // This should never happen
    throw new Error('value is not a bool');
  }
  if (!isBoolValue(other)) {
    return boolValue(false);
  }
  return boolValue(value.kind.value === other.kind.value);
}

export function isZeroBoolValue(value: Value) {
  if (!isBoolValue(value)) {
    // This should never happen
    throw new Error('value is not a bool');
  }
  return equalBoolValue(value, boolValue(false));
}

export const BOOL_TRAITS = new Set([Trait.COMPARER_TYPE, Trait.NEGATER_TYPE]);

export function compareBoolValue(value: Value, other: Value) {
  if (!isBoolValue(value)) {
    // This should never happen
    throw new Error('value is not a bool');
  }
  if (!isBoolValue(other)) {
    return new Error('no such overload');
  }
  if (value.kind.value === other.kind.value) {
    return int64Value(BigInt(0));
  }
  if (!value.kind.value && other.kind.value) {
    return int64Value(BigInt(-1));
  }
  return int64Value(BigInt(1));
}

export function negateBoolValue(value: Value) {
  if (!isBoolValue(value)) {
    // This should never happen
    throw new Error('value is not a bool');
  }
  return boolValue(!value.kind.value);
}
