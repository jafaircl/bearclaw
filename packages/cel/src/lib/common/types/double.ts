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
  DoubleValueSchema,
  FloatValueSchema,
  anyPack,
} from '@bufbuild/protobuf/wkt';
import { formatCELType } from '../format';
import { boolValue } from './bool';
import { compareNumberValues } from './compare';
import { int64Value, isValidInt64 } from './int';
import { NativeType } from './native';
import { isNumberValue } from './number';
import { primitiveType } from './primitive';
import { stringValue } from './string';
import { Trait } from './traits/trait';
import { isValidUint64, uint64Value } from './uint';

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

export function convertDoubleValueToNative(value: Value, type: NativeType) {
  if (!isDoubleValue(value)) {
    throw new Error('double value is not a double');
  }
  switch (type) {
    case Number:
      return value.kind.value;
    case AnySchema:
      return anyPack(
        DoubleValueSchema,
        create(DoubleValueSchema, { value: value.kind.value })
      );
    case DoubleValueSchema:
      return create(DoubleValueSchema, { value: value.kind.value });
    case FloatValueSchema:
      return create(FloatValueSchema, { value: value.kind.value });
    default:
      break;
  }
  return new Error(
    `type conversion error from '${formatCELType(DOUBLE_TYPE)}' to '${
      type.name
    }'`
  );
}

export function convertDoubleValueToType(value: Value, type: Type) {
  if (!isDoubleValue(value)) {
    throw new Error('double value is not a double');
  }
  switch (type.typeKind.case) {
    case 'primitive':
      switch (type.typeKind.value) {
        case Type_PrimitiveType.DOUBLE:
          return doubleValue(value.kind.value);
        case Type_PrimitiveType.INT64:
          if (
            Number.isNaN(value.kind.value) ||
            value.kind.value >= Infinity ||
            value.kind.value <= -Infinity ||
            !isValidInt64(BigInt(value.kind.value))
          ) {
            return new Error('integer overflow');
          }
          return int64Value(BigInt(value.kind.value));
        case Type_PrimitiveType.UINT64:
          if (
            Number.isNaN(value.kind.value) ||
            value.kind.value >= Infinity ||
            !isValidUint64(BigInt(value.kind.value))
          ) {
            return new Error('unsigned integer overflow');
          }
          return uint64Value(BigInt(value.kind.value));
        case Type_PrimitiveType.STRING:
          return stringValue(value.kind.value.toString());
        default:
          break;
      }
      break;
    case 'type':
      return DOUBLE_TYPE;
    default:
      break;
  }
  return new Error(
    `type conversion error from '${formatCELType(
      DOUBLE_TYPE
    )}' to '${formatCELType(type)}'`
  );
}

export function equalDoubleValue(value: Value, other: Value) {
  if (!isDoubleValue(value)) {
    throw new Error('double value is not a double');
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

export function isZeroDoubleValue(value: Value) {
  if (!isDoubleValue(value)) {
    throw new Error('double value is not a double');
  }
  return boolValue(value.kind.value === 0);
}

export const DOUBLE_TRAITS = new Set([
  Trait.ADDER_TYPE,
  Trait.COMPARER_TYPE,
  Trait.DIVIDER_TYPE,
  Trait.MULTIPLIER_TYPE,
  Trait.NEGATER_TYPE,
  Trait.SUBTRACTOR_TYPE,
]);

export function addDoubleValue(value: Value, other: Value) {
  if (!isDoubleValue(value)) {
    throw new Error('double value is not a double');
  }
  if (!isNumberValue(other)) {
    return new Error('no such overload');
  }
  return doubleValue(value.kind.value + Number(other.kind.value));
}

export function compareDoubleValue(value: Value, other: Value) {
  if (!isDoubleValue(value)) {
    throw new Error('double value is not a double');
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
  if (value.kind.value < Number.MIN_SAFE_INTEGER) {
    return int64Value(BigInt(-1));
  }
  if (value.kind.value > Number.MAX_SAFE_INTEGER) {
    return int64Value(BigInt(1));
  }
  return compareNumberValues(value, other);
}

export function divideDoubleValue(value: Value, other: Value) {
  if (!isDoubleValue(value)) {
    throw new Error('double value is not a double');
  }
  if (!isNumberValue(other)) {
    return new Error('no such overload');
  }
  return doubleValue(value.kind.value / Number(other.kind.value));
}

export function multiplyDoubleValue(value: Value, other: Value) {
  if (!isDoubleValue(value)) {
    throw new Error('double value is not a double');
  }
  if (!isNumberValue(other)) {
    return new Error('no such overload');
  }
  return doubleValue(value.kind.value * Number(other.kind.value));
}

export function negateDoubleValue(value: Value) {
  if (!isDoubleValue(value)) {
    throw new Error('double value is not a double');
  }
  return doubleValue(-value.kind.value);
}

export function subtractDoubleValue(value: Value, other: Value) {
  if (!isDoubleValue(value)) {
    throw new Error('double value is not a double');
  }
  if (!isNumberValue(other)) {
    return new Error('no such overload');
  }
  return doubleValue(value.kind.value - Number(other.kind.value));
}
