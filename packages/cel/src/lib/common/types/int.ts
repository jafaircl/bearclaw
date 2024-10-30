import {
  Type,
  Type_PrimitiveType,
  Type_WellKnownType,
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
  Int32ValueSchema,
  Int64ValueSchema,
  anyPack,
  timestampFromMs,
} from '@bufbuild/protobuf/wkt';
import { formatCELType } from '../format';
import { boolValue } from './bool';
import { compareNumberValues } from './compare';
import { isConstExpr } from './constant';
import { doubleValue, isDoubleValue } from './double';
import { NativeType } from './native';
import { isNumberValue } from './number';
import { primitiveType } from './primitive';
import { stringValue } from './string';
import { MAX_UNIX_TIME, MIN_UNIX_TIME, timestampValue } from './timestamp';
import { Trait } from './traits/trait';
import { isValidUint64, uint64Value } from './uint';

export const MAX_INT64 = BigInt(2) ** BigInt(63) - BigInt(1);
export const MIN_INT64 = BigInt(-1) * BigInt(2) ** BigInt(63);

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

export function isValidInt32(value: number) {
  return (
    !Number.isNaN(value) &&
    value >= Number.MIN_SAFE_INTEGER &&
    value <= Number.MAX_SAFE_INTEGER &&
    value < Infinity &&
    value > -Infinity
  );
}

export function isValidInt64(value: bigint) {
  return (
    !Number.isNaN(value) &&
    value <= MAX_INT64 &&
    value >= MIN_INT64 &&
    value < Infinity &&
    value > -Infinity
  );
}

export function convertInt64ValueToNative(value: Value, type: NativeType) {
  if (!isInt64Value(value)) {
    throw new Error('int64 value is not a int64');
  }
  switch (type) {
    case BigInt:
      return value.kind.value;
    case Number:
      return Number(value.kind.value);
    case AnySchema:
      return anyPack(
        Int64ValueSchema,
        create(Int64ValueSchema, { value: value.kind.value })
      );
    case Int32ValueSchema:
      if (!isValidInt32(Number(value.kind.value))) {
        return new Error('integer overflow');
      }
      return create(Int32ValueSchema, { value: Number(value.kind.value) });
    case Int64ValueSchema:
      if (!isValidInt64(value.kind.value)) {
        return new Error('integer overflow');
      }
      return create(Int64ValueSchema, { value: value.kind.value });
    default:
      break;
  }
  return new Error(
    `type conversion error from '${formatCELType(INT64_TYPE)}' to '${
      type.name
    }'`
  );
}

export function convertInt64ValueToType(value: Value, type: Type) {
  if (!isInt64Value(value)) {
    throw new Error('int64 value is not a int64');
  }
  switch (type.typeKind.case) {
    case 'primitive':
      switch (type.typeKind.value) {
        case Type_PrimitiveType.INT64:
          if (
            Number.isNaN(value.kind.value) ||
            !isValidInt64(value.kind.value)
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
    case 'wellKnown':
      switch (type.typeKind.value) {
        case Type_WellKnownType.TIMESTAMP:
          if (
            Number.isNaN(value.kind.value) ||
            value.kind.value < MIN_UNIX_TIME ||
            value.kind.value > MAX_UNIX_TIME
          ) {
            return new Error('timestamp overflow');
          }
          return timestampValue(timestampFromMs(Number(value.kind.value)));
        default:
          break;
      }
      break;
    case 'type':
      return INT64_TYPE;
    default:
      break;
  }
  return new Error(
    `type conversion error from '${formatCELType(
      INT64_TYPE
    )}' to '${formatCELType(type)}'`
  );
}

export function equalInt64Value(value: Value, other: Value) {
  if (!isInt64Value(value)) {
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

export function isZeroInt64Value(value: Value) {
  if (!isInt64Value(value)) {
    throw new Error('int64 value is not a int64');
  }
  return boolValue(value.kind.value === BigInt(0));
}

export const INT64_TRAITS = new Set([
  Trait.ADDER_TYPE,
  Trait.COMPARER_TYPE,
  Trait.DIVIDER_TYPE,
  Trait.MODDER_TYPE,
  Trait.MULTIPLIER_TYPE,
  Trait.NEGATER_TYPE,
  Trait.SUBTRACTOR_TYPE,
]);

export function addInt64Value(value: Value, other: Value) {
  if (!isInt64Value(value)) {
    throw new Error('int64 value is not a int64');
  }
  if (!isNumberValue(other)) {
    return new Error('no such overload');
  }
  if (
    (other.kind.value > 0 &&
      value.kind.value > MAX_INT64 - BigInt(other.kind.value)) ||
    (other.kind.value < 0 &&
      value.kind.value < MIN_INT64 - BigInt(other.kind.value))
  ) {
    return new Error('integer overflow');
  }
  return int64Value(value.kind.value + BigInt(other.kind.value));
}

export function compareInt64Value(value: Value, other: Value) {
  if (!isInt64Value(value)) {
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
    return int64Value(BigInt(-1));
  }
  if (isDoubleValue(other) && value.kind.value > Number.MAX_SAFE_INTEGER) {
    return int64Value(BigInt(1));
  }
  return compareNumberValues(value, other);
}

export function divideInt64Value(value: Value, other: Value) {
  if (!isInt64Value(value)) {
    throw new Error('int64 value is not a int64');
  }
  if (!isNumberValue(other)) {
    return new Error('no such overload');
  }
  if (Number(other.kind.value) === 0) {
    return new Error('divide by zero');
  }
  // Negating MinInt64 would result in a valid of MaxInt64+1.
  if (value.kind.value === MIN_INT64 && Number(other.kind.value) === -1) {
    return new Error('integer overflow');
  }
  return int64Value(value.kind.value / BigInt(other.kind.value));
}

export function moduloInt64Value(value: Value, other: Value) {
  if (!isInt64Value(value)) {
    throw new Error('int64 value is not a int64');
  }
  if (!isNumberValue(other)) {
    return new Error('no such overload');
  }
  if (Number(other.kind.value) === 0) {
    return new Error('modulus by zero');
  }
  // Negating MinInt64 would result in a valid of MaxInt64+1.
  if (value.kind.value === MIN_INT64 && Number(other.kind.value) === -1) {
    return new Error('integer overflow');
  }
  return int64Value(value.kind.value % BigInt(other.kind.value));
}

export function multiplyInt64Value(value: Value, other: Value) {
  if (!isInt64Value(value)) {
    throw new Error('int64 value is not a int64');
  }
  if (!isNumberValue(other)) {
    return new Error('no such overload');
  }
  const x = value.kind.value;
  const y = BigInt(other.kind.value);
  // Detecting multiplication overflow is more complicated than the others. The
  // first two detect attempting to negate MinInt64, which would result in
  // MaxInt64+1. The other four detect normal overflow conditions.
  if (
    (x === BigInt(-1) && y == MIN_INT64) ||
    (y === BigInt(-1) && x == MIN_INT64) ||
    // x is positive, y is positive
    (x > 0 && y > 0 && x > MAX_INT64 / y) ||
    // x is positive, y is negative
    (x > 0 && y < 0 && y < MIN_INT64 / x) ||
    // x is negative, y is positive
    (x < 0 && y > 0 && x < MIN_INT64 / y) ||
    // x is negative, y is negative
    (x < 0 && y < 0 && y < MAX_INT64 / x)
  ) {
    return new Error('integer overflow');
  }
  return int64Value(value.kind.value * BigInt(other.kind.value));
}

export function negateInt64Value(value: Value) {
  if (!isInt64Value(value)) {
    throw new Error('int64 value is not a int64');
  }
  if (value.kind.value === MIN_INT64) {
    return new Error('integer overflow');
  }
  // Negating MinInt64 would result in a value of MaxInt64+1.
  if (value.kind.value === MIN_INT64) {
    return new Error('integer overflow');
  }
  return int64Value(-value.kind.value);
}

export function subtractInt64Value(value: Value, other: Value) {
  if (!isInt64Value(value)) {
    throw new Error('int64 value is not a int64');
  }
  if (!isNumberValue(other)) {
    return new Error('no such overload');
  }
  if (
    (other.kind.value < 0 &&
      value.kind.value > MAX_INT64 + BigInt(other.kind.value)) ||
    (other.kind.value > 0 &&
      value.kind.value < MIN_INT64 + BigInt(other.kind.value))
  ) {
    return new Error('integer overflow');
  }
  return int64Value(value.kind.value - BigInt(other.kind.value));
}
