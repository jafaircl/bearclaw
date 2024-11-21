/* eslint-disable no-case-declarations */
import { isNil } from '@bearclaw/is';
import { create } from '@bufbuild/protobuf';
import { AnySchema, StringValueSchema, anyPack } from '@bufbuild/protobuf/wkt';
import { parseBytes } from '../constants';
import {
  CONTAINS_OVERLOAD,
  ENDS_WITH_OVERLOAD,
  STARTS_WITH_OVERLOAD,
} from '../overloads';
import { RefType, RefVal } from '../ref/reference';
import { BoolRefVal } from './bool';
import { BytesRefVal } from './bytes';
import { DoubleRefVal } from './double';
import { DurationRefVal, parseISO8061DurationString } from './duration';
import { ErrorRefVal } from './error';
import { IntRefVal } from './int';
import { NativeType } from './native';
import { TimestampRefVal, timestampFromDateString } from './timestamp';
import { Comparer } from './traits/comparer';
import { Matcher } from './traits/matcher';
import { Adder } from './traits/math';
import { Receiver } from './traits/receiver';
import { Sizer } from './traits/sizer';
import { Zeroer } from './traits/zeroer';
import {
  BoolType,
  BytesType,
  DoubleType,
  DurationType,
  IntType,
  StringType,
  TimestampType,
  TypeType,
  UintType,
} from './types';
import { UintRefVal } from './uint';

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
    switch (substr.type()) {
      case StringType:
        return new BoolRefVal(str.includes(substr.value()));
      default:
        return ErrorRefVal.maybeNoSuchOverload(substr);
    }
  }

  static stringStartsWith(str: string, prefix: RefVal) {
    switch (prefix.type()) {
      case StringType:
        return new BoolRefVal(str.startsWith(prefix.value()));
      default:
        return ErrorRefVal.maybeNoSuchOverload(prefix);
    }
  }

  static stringEndsWith(str: string, suffix: RefVal) {
    switch (suffix.type()) {
      case StringType:
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
    switch (type) {
      case BoolType:
        return new BoolRefVal(this._value === 'true');
      case BytesType:
        return new BytesRefVal(parseBytes(`b"${this._value}"`));
      case DoubleType:
        return new DoubleRefVal(parseFloat(this._value));
      case DurationType:
        const duration = parseISO8061DurationString(this._value.toUpperCase());
        if (duration instanceof Error) {
          return ErrorRefVal.errDurationOutOfRange;
        }
        return new DurationRefVal(duration);
      case IntType:
        return new IntRefVal(BigInt(parseInt(this._value, 10)));
      case StringType:
        return new StringRefVal(this._value);
      case TimestampType:
        const ts = timestampFromDateString(this._value);
        if (isNil(ts)) {
          return ErrorRefVal.errTimestampOutOfRange;
        }
        return new TimestampRefVal(ts);
      case TypeType:
        return StringType;
      case UintType:
        return new UintRefVal(BigInt(parseInt(this._value, 10)));
      // TODO: implement other conversions
      default:
        return ErrorRefVal.typeConversionError(this, type);
    }
  }

  equal(other: RefVal): RefVal {
    switch (other.type()) {
      case StringType:
        return new BoolRefVal(this._value === other.value());
      default:
        return BoolRefVal.False;
    }
  }

  type(): RefType {
    return StringType;
  }

  value() {
    return this._value;
  }

  add(other: RefVal): RefVal {
    switch (other.type()) {
      case StringType:
        return new StringRefVal(this._value + other.value());
      default:
        return ErrorRefVal.maybeNoSuchOverload(other);
    }
  }

  compare(other: RefVal): RefVal {
    switch (other.type()) {
      case StringType:
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
    switch (pattern.type()) {
      case StringType:
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

export function isStringRefVal(val: RefVal): val is StringRefVal {
  switch (val.type()) {
    case StringType:
      return true;
    default:
      return false;
  }
}

export function stringContains(str: RefVal, subStr: RefVal): RefVal {
  if (!isStringRefVal(str)) {
    return ErrorRefVal.maybeNoSuchOverload(str);
  }
  if (!isStringRefVal(subStr)) {
    return ErrorRefVal.maybeNoSuchOverload(subStr);
  }
  return new BoolRefVal(str.value().indexOf(subStr.value()) > -1);
}

export function stringEndsWith(str: RefVal, suffix: RefVal): RefVal {
  if (!isStringRefVal(str)) {
    return ErrorRefVal.maybeNoSuchOverload(str);
  }
  if (!isStringRefVal(suffix)) {
    return ErrorRefVal.maybeNoSuchOverload(suffix);
  }
  return new BoolRefVal(str.value().endsWith(suffix.value()));
}

export function stringStartsWith(str: RefVal, prefix: RefVal): RefVal {
  if (!isStringRefVal(str)) {
    return ErrorRefVal.maybeNoSuchOverload(str);
  }
  if (!isStringRefVal(prefix)) {
    return ErrorRefVal.maybeNoSuchOverload(prefix);
  }
  return new BoolRefVal(str.value().startsWith(prefix.value()));
}
