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
import {
  AnySchema,
  UInt32ValueSchema,
  UInt64ValueSchema,
  anyPack,
} from '@bufbuild/protobuf/wkt';
import { formatCELType } from '../format';
import { boolValue } from './bool';
import { compareNumberValues } from './compare';
import { isConstExpr } from './constant';
import { doubleValue, isDoubleValue } from './double';
import { MAX_INT64, int64Value } from './int';
import { NativeType } from './native';
import { isNumberValue } from './number';
import { primitiveType } from './primitive';
import { stringValue } from './string';
import { Trait } from './traits/trait';

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

export function isValidUint32(value: number) {
  return (
    !Number.isNaN(value) &&
    value >= 0 &&
    value <= Number.MAX_SAFE_INTEGER &&
    value <= Infinity
  );
}

export function isValidUint64(value: bigint) {
  return (
    !Number.isNaN(value) &&
    value >= BigInt(0) &&
    value <= MAX_INT64 &&
    value <= Infinity
  );
}

export function convertUint64ValueToNative(value: Value, type: NativeType) {
  if (!isUint64Value(value)) {
    throw new Error('int64 value is not a int64');
  }
  switch (type) {
    case BigInt:
      return value.kind.value;
    case Number:
      return Number(value.kind.value);
    case AnySchema:
      return anyPack(
        UInt64ValueSchema,
        create(UInt64ValueSchema, { value: value.kind.value })
      );
    case UInt32ValueSchema:
      if (!isValidUint32(Number(value.kind.value))) {
        return new Error('unsigned integer overflow');
      }
      return create(UInt32ValueSchema, { value: Number(value.kind.value) });
    case UInt64ValueSchema:
      if (!isValidUint64(value.kind.value)) {
        return new Error('unsigned integer overflow');
      }
      return create(UInt64ValueSchema, { value: value.kind.value });
    default:
      break;
  }
  return new Error(
    `type conversion error from '${formatCELType(UINT64_TYPE)}' to '${
      type.name
    }'`
  );
}

export function convertUint64ValueToType(value: Value, type: Type) {
  if (!isUint64Value(value)) {
    throw new Error('int64 value is not a int64');
  }
  switch (type.typeKind.case) {
    case 'primitive':
      switch (type.typeKind.value) {
        case Type_PrimitiveType.INT64:
          if (
            Number.isNaN(value.kind.value) ||
            !isValidUint64(value.kind.value)
          ) {
            return new Error('integer overflow');
          }
          return int64Value(value.kind.value);
        case Type_PrimitiveType.UINT64:
          if (
            Number.isNaN(value.kind.value) ||
            !isValidUint64(value.kind.value)
          ) {
            return new Error('unsigned integer overflow');
          }
          return uint64Value(value.kind.value);
        case Type_PrimitiveType.DOUBLE:
          return doubleValue(Number(value.kind.value));
        case Type_PrimitiveType.STRING:
          return stringValue(value.kind.value.toString());
        default:
          break;
      }
      break;
    case 'type':
      return UINT64_TYPE;
    default:
      break;
  }
  return new Error(
    `type conversion error from '${formatCELType(
      UINT64_TYPE
    )}' to '${formatCELType(type)}'`
  );
}

export function equalUint64Value(value: Value, other: Value) {
  if (!isUint64Value(value)) {
    throw new Error('int64 value is not a int64');
  }
  if (!isNumberValue(other)) {
    return boolValue(false);
  }
  if (
    Number.isNaN(Number(value.kind.value)) ||
    Number.isNaN(Number(other.kind.value))
  ) {
    return boolValue(false);
  }
  const compared = compareNumberValues(value, other);
  if (compared instanceof Error) {
    return boolValue(false);
  }
  return boolValue(compared.kind.value === BigInt(0));
}

export function isZeroUint64Value(value: Value) {
  if (!isUint64Value(value)) {
    throw new Error('int64 value is not a int64');
  }
  return boolValue(value.kind.value === BigInt(0));
}

export const UINT64_TRAITS = new Set([
  Trait.ADDER_TYPE,
  Trait.COMPARER_TYPE,
  Trait.DIVIDER_TYPE,
  Trait.MODDER_TYPE,
  Trait.MULTIPLIER_TYPE,
  Trait.SUBTRACTOR_TYPE,
]);

export function addUint64Value(value: Value, other: Value) {
  if (!isUint64Value(value)) {
    throw new Error('int64 value is not a int64');
  }
  if (!isNumberValue(other)) {
    return new Error('no such overload');
  }
  if (
    (other.kind.value > 0 &&
      value.kind.value > MAX_INT64 - BigInt(other.kind.value)) ||
    (other.kind.value < 0 &&
      value.kind.value < Math.abs(Number(other.kind.value)))
  ) {
    return new Error('unsigned integer overflow');
  }
  return uint64Value(value.kind.value + BigInt(other.kind.value));
}

export function compareUint64Value(value: Value, other: Value) {
  if (!isUint64Value(value)) {
    throw new Error('int64 value is not a int64');
  }
  if (!isNumberValue(other)) {
    return new Error('no such overload');
  }
  if (
    Number.isNaN(Number(value.kind.value)) ||
    Number.isNaN(Number(other.kind.value))
  ) {
    return new Error('NaN values cannot be ordered');
  }
  if (isDoubleValue(other) && value.kind.value < Number.MIN_SAFE_INTEGER) {
    return uint64Value(BigInt(-1));
  }
  if (isDoubleValue(other) && value.kind.value > Number.MAX_SAFE_INTEGER) {
    return uint64Value(BigInt(1));
  }
  return compareNumberValues(value, other);
}

export function divideUint64Value(value: Value, other: Value) {
  if (!isUint64Value(value)) {
    throw new Error('int64 value is not a int64');
  }
  if (!isNumberValue(other)) {
    return new Error('no such overload');
  }
  if (Number(other.kind.value) === 0) {
    return new Error('divide by zero');
  }
  return uint64Value(value.kind.value / BigInt(other.kind.value));
}

export function moduloUint64Value(value: Value, other: Value) {
  if (!isUint64Value(value)) {
    throw new Error('int64 value is not a int64');
  }
  if (!isNumberValue(other)) {
    return new Error('no such overload');
  }
  if (Number(other.kind.value) === 0) {
    return new Error('modulus by zero');
  }
  return uint64Value(value.kind.value % BigInt(other.kind.value));
}

export function multiplyUint64Value(value: Value, other: Value) {
  if (!isUint64Value(value)) {
    throw new Error('int64 value is not a int64');
  }
  if (!isNumberValue(other)) {
    return new Error('no such overload');
  }
  const x = value.kind.value;
  const y = BigInt(other.kind.value);
  // Detecting multiplication overflow is more complicated than the others. The
  // first two detect attempting to negate MinUint64, which would result in
  // MaxUint64+1. The other four detect normal overflow conditions.
  if (y !== BigInt(0) && x > MAX_INT64 / y) {
    return new Error('unsigned integer overflow');
  }
  return uint64Value(value.kind.value * BigInt(other.kind.value));
}

export function subtractUint64Value(value: Value, other: Value) {
  if (!isUint64Value(value)) {
    throw new Error('int64 value is not a int64');
  }
  if (!isNumberValue(other)) {
    return new Error('no such overload');
  }
  if (other.kind.value > value.kind.value) {
    return new Error('unsigned integer overflow');
  }
  const result = value.kind.value - BigInt(other.kind.value);
  if (result < BigInt(0) || result > MAX_INT64) {
    return new Error('unsigned integer overflow');
  }
  return uint64Value(result);
}
