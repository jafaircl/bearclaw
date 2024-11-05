/* eslint-disable no-case-declarations */
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
  StringValueSchema,
  anyPack,
  timestampFromDate,
} from '@bufbuild/protobuf/wkt';
import {
  CONTAINS_OVERLOAD,
  ENDS_WITH_OVERLOAD,
  STARTS_WITH_OVERLOAD,
} from '../../overloads';
import { parseBytesConstant } from '../constants';
import { formatCELType } from '../format';
import { boolValue } from './bool';
import { bytesValue } from './bytes';
import { isConstExpr } from './constant';
import { doubleValue } from './double';
import { durationValue, parseISO8061DurationString } from './duration';
import { int64Value } from './int';
import { NativeType } from './native';
import { primitiveType } from './primitive';
import { timestampValue } from './timestamp';
import { Trait } from './traits/trait';
import { uint64Value } from './uint';

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

export function convertStringValueToNative(value: Value, type: NativeType) {
  if (!isStringValue(value)) {
    throw new Error('string value is not a string');
  }
  switch (type) {
    case String:
      return value.kind.value;
    case Uint8Array:
      return parseBytesConstant(`b"${value.kind.value}"`).constantKind
        .value as Uint8Array;
    case AnySchema:
      return anyPack(
        StringValueSchema,
        create(StringValueSchema, { value: value.kind.value })
      );
    case StringValueSchema:
      return create(StringValueSchema, { value: value.kind.value });
    default:
      break;
  }
  return new Error(
    `type conversion error from '${formatCELType(STRING_TYPE)}' to '${
      type.name
    }'`
  );
}

export function convertStringValueToType(value: Value, type: Type) {
  if (!isStringValue(value)) {
    throw new Error('string value is not a string');
  }
  switch (type.typeKind.case) {
    case 'primitive':
      switch (type.typeKind.value) {
        case Type_PrimitiveType.BOOL:
          return boolValue(value.kind.value === 'true');
        case Type_PrimitiveType.BYTES:
          return bytesValue(
            parseBytesConstant(`b"${value.kind.value}"`).constantKind
              .value as Uint8Array
          );
        case Type_PrimitiveType.DOUBLE:
          return doubleValue(parseFloat(value.kind.value));
        case Type_PrimitiveType.INT64:
          return int64Value(BigInt(parseInt(value.kind.value)));
        case Type_PrimitiveType.STRING:
          return stringValue(value.kind.value.toString());
        case Type_PrimitiveType.UINT64:
          return uint64Value(BigInt(parseInt(value.kind.value)));
        default:
          break;
      }
      break;
    case 'wellKnown':
      switch (type.typeKind.value) {
        case Type_WellKnownType.DURATION:
          const duration = parseISO8061DurationString(
            value.kind.value.toUpperCase()
          );
          if (duration instanceof Error) {
            return duration;
          }
          return durationValue(duration);
        case Type_WellKnownType.TIMESTAMP:
          return timestampValue(timestampFromDate(new Date(value.kind.value)));
        default:
          break;
      }
      break;
    case 'type':
      return STRING_TYPE;
    default:
      break;
  }
  return new Error(
    `type conversion error from '${formatCELType(
      STRING_TYPE
    )}' to '${formatCELType(type)}'`
  );
}

export function equalStringValue(value: Value, other: Value) {
  if (!isStringValue(value)) {
    // This should never happen
    throw new Error('value is not a string');
  }
  if (!isStringValue(other)) {
    return boolValue(false);
  }
  return boolValue(value.kind.value === other.kind.value);
}

export function isZeroStringValue(value: Value) {
  if (!isStringValue(value)) {
    throw new Error('string value is not a string');
  }
  return boolValue(value.kind.value === '');
}

export const STRING_TRAITS = new Set<Trait>([
  Trait.ADDER_TYPE,
  Trait.COMPARER_TYPE,
  Trait.MATCHER_TYPE,
  Trait.RECEIVER_TYPE,
  Trait.SIZER_TYPE,
]);

export function addStringValue(value: Value, other: Value) {
  if (!isStringValue(value)) {
    throw new Error('string value is not a string');
  }
  if (!isStringValue(other)) {
    return new Error('no such overload');
  }
  return stringValue(value.kind.value + other.kind.value);
}

export function compareStringValue(value: Value, other: Value) {
  if (!isStringValue(value)) {
    throw new Error('string value is not a string');
  }
  if (!isStringValue(other)) {
    return new Error('no such overload');
  }
  if (value.kind.value < other.kind.value) {
    return int64Value(BigInt(-1));
  }
  if (value.kind.value > other.kind.value) {
    return int64Value(BigInt(1));
  }
  return int64Value(BigInt(0));
}

export function matchStringValue(value: Value, other: Value) {
  if (!isStringValue(value)) {
    throw new Error('string value is not a string');
  }
  if (!isStringValue(other)) {
    return new Error('no such overload');
  }
  const pattern = new RegExp(other.kind.value);
  return boolValue(pattern.test(value.kind.value));
}

function stringValueContains(value: Value, other: Value) {
  if (!isStringValue(value)) {
    throw new Error('string value is not a string');
  }
  if (!isStringValue(other)) {
    return new Error('no such overload');
  }
  return boolValue(value.kind.value.includes(other.kind.value));
}

function stringValueStartsWith(value: Value, other: Value) {
  if (!isStringValue(value)) {
    throw new Error('string value is not a string');
  }
  if (!isStringValue(other)) {
    return new Error('no such overload');
  }
  return boolValue(value.kind.value.startsWith(other.kind.value));
}

function stringValueEndsWith(value: Value, other: Value) {
  if (!isStringValue(value)) {
    throw new Error('string value is not a string');
  }
  if (!isStringValue(other)) {
    return new Error('no such overload');
  }
  return boolValue(value.kind.value.endsWith(other.kind.value));
}

export const STRING_OVERLOADS = new Map<
  string,
  (value: Value, other: Value) => Value | Error
>([
  [CONTAINS_OVERLOAD, stringValueContains],
  [STARTS_WITH_OVERLOAD, stringValueStartsWith],
  [ENDS_WITH_OVERLOAD, stringValueEndsWith],
]);

export function receiveStringValue(
  value: Value,
  fn: string,
  overload: string,
  ...args: Value[]
) {
  if (!isStringValue(value)) {
    throw new Error('string value is not a string');
  }
  const f = STRING_OVERLOADS.get(fn);
  if (f) {
    return f(value, args[0]);
  }
  return new Error('no such overload');
}

export function sizeStringValue(value: Value) {
  if (!isStringValue(value)) {
    throw new Error('string value is not a string');
  }
  return int64Value(BigInt(value.kind.value.length));
}
