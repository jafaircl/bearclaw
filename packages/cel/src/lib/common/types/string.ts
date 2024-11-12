/* eslint-disable no-case-declarations */
import { isNil } from '@bearclaw/is';
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
import { parseBytes } from '../constants';
import { formatCELType } from '../format';
import { RefType, RefTypeEnum, RefVal } from '../ref/reference';
import { BoolRefVal, boolValue } from './bool';
import { BytesRefVal, bytesValue } from './bytes';
import { isConstExpr } from './constant';
import { DoubleRefVal, doubleValue } from './double';
import {
  DurationRefVal,
  durationValue,
  parseISO8061DurationString,
} from './duration';
import { ErrorRefVal } from './error';
import { IntRefVal, int64Value } from './int';
import { NativeType } from './native';
import { primitiveType } from './primitive';
import {
  TimestampRefVal,
  timestampFromDateString,
  timestampValue,
} from './timestamp';
import { Comparer } from './traits/comparer';
import { Matcher } from './traits/matcher';
import { Adder } from './traits/math';
import { Receiver } from './traits/receiver';
import { Sizer } from './traits/sizer';
import { Trait } from './traits/trait';
import { Zeroer } from './traits/zeroer';
import { TypeValue } from './type';
import { UintRefVal, uint64Value } from './uint';

export const STRING_CEL_TYPE = primitiveType(Type_PrimitiveType.STRING);

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
      return parseBytes(`b"${value.kind.value}"`);
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
    `type conversion error from '${formatCELType(STRING_CEL_TYPE)}' to '${
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
          return bytesValue(parseBytes(`b"${value.kind.value}"`));
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
      return STRING_CEL_TYPE;
    default:
      break;
  }
  return new Error(
    `type conversion error from '${formatCELType(
      STRING_CEL_TYPE
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

export const STRING_REF_TYPE = new TypeValue(RefTypeEnum.STRING, STRING_TRAITS);

export class StringRefVal
  implements RefVal, Adder, Comparer, Matcher, Receiver, Sizer, Zeroer
{
  // This has to be a TS private field instead of a # private field because
  // otherwise the tests will not be able to access it to check for equality.
  // TODO: do we want to alter the tests to use the getter instead?
  private readonly _value: string;

  constructor(value: string) {
    this._value = value;
  }

  static stringContains(str: string, substr: RefVal) {
    switch (substr.type().typeName()) {
      case RefTypeEnum.STRING:
        return new BoolRefVal(str.includes(substr.value()));
      default:
        return ErrorRefVal.maybeNoSuchOverload(substr);
    }
  }

  static stringStartsWith(str: string, prefix: RefVal) {
    switch (prefix.type().typeName()) {
      case RefTypeEnum.STRING:
        return new BoolRefVal(str.startsWith(prefix.value()));
      default:
        return ErrorRefVal.maybeNoSuchOverload(prefix);
    }
  }

  static stringEndsWith(str: string, suffix: RefVal) {
    switch (suffix.type().typeName()) {
      case RefTypeEnum.STRING:
        return new BoolRefVal(str.endsWith(suffix.value()));
      default:
        return ErrorRefVal.maybeNoSuchOverload(suffix);
    }
  }

  static Overloads = new Map([
    [CONTAINS_OVERLOAD, StringRefVal.stringContains],
    [STARTS_WITH_OVERLOAD, StringRefVal.stringStartsWith],
    [ENDS_WITH_OVERLOAD, StringRefVal.stringEndsWith],
  ]);

  celValue(): Value {
    return stringValue(this._value);
  }

  convertToNative(type: NativeType) {
    switch (type) {
      case String:
        return this._value;
      case Uint8Array:
        return parseBytes(`b"${this._value}"`);
      case AnySchema:
        return anyPack(
          StringValueSchema,
          create(StringValueSchema, { value: this._value })
        );
      case StringValueSchema:
        return create(StringValueSchema, { value: this._value });
      default:
        return ErrorRefVal.nativeTypeConversionError(this, type);
    }
  }

  convertToType(type: RefType): RefVal {
    switch (type.typeName()) {
      case RefTypeEnum.BOOL:
        return new BoolRefVal(this._value === 'true');
      case RefTypeEnum.BYTES:
        return new BytesRefVal(parseBytes(`b"${this._value}"`));
      case RefTypeEnum.DOUBLE:
        return new DoubleRefVal(parseFloat(this._value));
      case RefTypeEnum.DURATION:
        const duration = parseISO8061DurationString(this._value.toUpperCase());
        if (duration instanceof Error) {
          return ErrorRefVal.errDurationOutOfRange;
        }
        return new DurationRefVal(duration);
      case RefTypeEnum.INT:
        return new IntRefVal(BigInt(parseInt(this._value, 10)));
      case RefTypeEnum.STRING:
        return new StringRefVal(this._value);
      case RefTypeEnum.TIMESTAMP:
        const ts = timestampFromDateString(this._value);
        if (isNil(ts)) {
          return ErrorRefVal.errTimestampOutOfRange;
        }
        return new TimestampRefVal(ts);
      case RefTypeEnum.TYPE:
        return STRING_REF_TYPE;
      case RefTypeEnum.UINT:
        return new UintRefVal(BigInt(parseInt(this._value, 10)));
      // TODO: implement other conversions
      default:
        return ErrorRefVal.typeConversionError(this, type);
    }
  }

  equal(other: RefVal): RefVal {
    switch (other.type().typeName()) {
      case RefTypeEnum.STRING:
        return new BoolRefVal(this._value === other.value());
      default:
        return BoolRefVal.False;
    }
  }

  type(): RefType {
    return STRING_REF_TYPE;
  }

  value() {
    return this._value;
  }

  add(other: RefVal): RefVal {
    switch (other.type().typeName()) {
      case RefTypeEnum.STRING:
        return new StringRefVal(this._value + other.value());
      default:
        return ErrorRefVal.maybeNoSuchOverload(other);
    }
  }

  compare(other: RefVal): RefVal {
    switch (other.type().typeName()) {
      case RefTypeEnum.STRING:
        if (this._value < other.value()) {
          return IntRefVal.IntNegOne;
        }
        if (this._value > other.value()) {
          return IntRefVal.IntOne;
        }
        return IntRefVal.IntZero;
      default:
        return ErrorRefVal.maybeNoSuchOverload(other);
    }
  }

  match(pattern: RefVal): RefVal {
    switch (pattern.type().typeName()) {
      case RefTypeEnum.STRING:
        const regexp = new RegExp(pattern.value());
        return new BoolRefVal(regexp.test(this._value));
      default:
        return ErrorRefVal.maybeNoSuchOverload(pattern);
    }
  }

  receive(fn: string, overload: string, args: RefVal[]): RefVal {
    const f = StringRefVal.Overloads.get(fn);
    if (f) {
      return f(this._value, args[0]);
    }
    return ErrorRefVal.errNoSuchOverload;
  }

  size(): RefVal {
    return new IntRefVal(BigInt(this._value.length));
  }

  isZeroValue(): boolean {
    return this._value === '';
  }
}
