/* eslint-disable no-case-declarations */
import { create } from '@bufbuild/protobuf';
import {
  AnySchema,
  Int32ValueSchema,
  Int64ValueSchema,
  anyPack,
} from '@bufbuild/protobuf/wkt';
import { RefType, RefVal } from '../ref/reference';
import { BoolRefVal } from './bool';
import { compareNumberRefVals } from './compare';
import { DoubleRefVal } from './double';
import { DurationRefVal, durationFromNanos } from './duration';
import { ErrorRefVal } from './error';
import { NativeType } from './native';
import { StringRefVal } from './string';
import {
  MAX_UNIX_TIME,
  MIN_UNIX_TIME,
  TimestampRefVal,
  timestamp,
} from './timestamp';
import { Comparer } from './traits/comparer';
import {
  Adder,
  Divider,
  Modder,
  Multiplier,
  Negater,
  Subtractor,
} from './traits/math';
import { Zeroer } from './traits/zeroer';
import {
  DoubleType,
  DurationType,
  ErrorType,
  IntType,
  StringType,
  TimestampType,
  TypeType,
  UintType,
} from './types';
import { UintRefVal, isValidUint64 } from './uint';

export const MAX_INT64 = BigInt(2) ** BigInt(63) - BigInt(1);
export const MIN_INT64 = BigInt(-1) * BigInt(2) ** BigInt(63);

export function isValidInt32(value: number) {
  return (
    !Number.isNaN(value) &&
    value >= Number.MIN_SAFE_INTEGER &&
    value <= Number.MAX_SAFE_INTEGER &&
    value < Infinity &&
    value > -Infinity &&
    Number.isInteger(value)
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

export class IntRefVal
  implements
    RefVal,
    Adder,
    Comparer,
    Divider,
    Modder,
    Multiplier,
    Negater,
    Subtractor,
    Zeroer
{
  // This has to be a TS private field instead of a # private field because
  // otherwise the tests will not be able to access it to check for equality.
  // TODO: do we want to alter the tests to use the getter instead?
  private readonly _value: bigint;

  constructor(value: bigint) {
    this._value = value;
  }

  static IntNegOne = new IntRefVal(BigInt(-1));
  static IntZero = new IntRefVal(BigInt(0));
  static IntOne = new IntRefVal(BigInt(1));
  static Min = MIN_INT64;
  static Max = MAX_INT64;

  convertToNative(type: NativeType) {
    switch (type) {
      case BigInt:
        return this._value;
      case Number:
        return Number(this._value);
      case AnySchema:
        return anyPack(
          Int64ValueSchema,
          create(Int64ValueSchema, { value: this._value })
        );
      case Int32ValueSchema:
        if (!isValidInt32(Number(this._value))) {
          return ErrorRefVal.errIntOverflow;
        }
        return create(Int32ValueSchema, { value: Number(this._value) });
      case Int64ValueSchema:
        if (!isValidInt64(this._value)) {
          return ErrorRefVal.errIntOverflow;
        }
        return create(Int64ValueSchema, { value: this._value });
      default:
        return ErrorRefVal.nativeTypeConversionError(this, type);
    }
  }

  convertToType(type: RefType): RefVal {
    switch (type) {
      case DoubleType:
        return new DoubleRefVal(Number(this._value));
      case IntType:
        if (Number.isNaN(this._value) || !isValidInt64(this._value)) {
          return ErrorRefVal.errIntOverflow;
        }
        return new IntRefVal(this._value);
      case StringType:
        return new StringRefVal(this._value.toString());
      case DurationType:
        if (this._value > MAX_INT64 || this._value < MIN_INT64) {
          return ErrorRefVal.errDurationOverflow;
        }
        // TODO: is this right? cel-go doesn't actually implement this even though there is a stdlib function for it
        return new DurationRefVal(durationFromNanos(this._value));
      case TimestampType:
        if (this._value > MAX_UNIX_TIME || this._value < MIN_UNIX_TIME) {
          return ErrorRefVal.errTimestampOverflow;
        }
        return new TimestampRefVal(timestamp(this._value));
      case TypeType:
        return IntType;
      case UintType:
        if (Number.isNaN(this._value) || !isValidUint64(this._value)) {
          return ErrorRefVal.errUintOverflow;
        }
        return new UintRefVal(this._value);
      default:
        return ErrorRefVal.typeConversionError(this, type);
    }
  }

  equal(other: RefVal): RefVal {
    if (Number.isNaN(this._value) || Number.isNaN(other?.value())) {
      return BoolRefVal.False;
    }
    switch (other.type()) {
      case DoubleType:
      case IntType:
      case UintType:
        const compared = compareNumberRefVals(this, other);
        if (compared.type() === ErrorType) {
          return compared;
        }
        return new BoolRefVal(compared.value() === BigInt(0));
      default:
        return BoolRefVal.False;
    }
  }

  type(): RefType {
    return IntType;
  }

  value() {
    return this._value;
  }

  isZeroValue(): boolean {
    return this._value === BigInt(0);
  }

  add(other: RefVal): RefVal {
    switch (other.type()) {
      case DoubleType:
      case IntType:
      case UintType:
        if (
          (other.value() > 0 &&
            this._value > MAX_INT64 - BigInt(other.value())) ||
          (other.value() < 0 && this._value < MIN_INT64 - BigInt(other.value()))
        ) {
          return ErrorRefVal.errIntOverflow;
        }
        return new IntRefVal(this._value + BigInt(other.value()));
      default:
        return ErrorRefVal.maybeNoSuchOverload(other);
    }
  }

  compare(other: RefVal): RefVal {
    if (
      Number.isNaN(Number(this._value)) ||
      Number.isNaN(Number(other.value()))
    ) {
      return new ErrorRefVal('NaN values cannot be ordered');
    }
    switch (other.type()) {
      case DoubleType:
        if (this._value < Number.MIN_SAFE_INTEGER) {
          return IntRefVal.IntNegOne;
        }
        if (this._value > Number.MAX_SAFE_INTEGER) {
          return IntRefVal.IntOne;
        }
        return compareNumberRefVals(this, other);
      case IntType:
      case UintType:
        return compareNumberRefVals(this, other);
      default:
        return ErrorRefVal.maybeNoSuchOverload(other);
    }
  }

  divide(denominator: RefVal): RefVal {
    switch (denominator.type()) {
      case DoubleType:
      case IntType:
      case UintType:
        if (Number(denominator.value()) === 0) {
          return ErrorRefVal.errDivideByZero;
        }
        // Negating MinInt64 would result in a valid of MaxInt64+1.
        if (this._value === MIN_INT64 && Number(denominator.value()) === -1) {
          return ErrorRefVal.errIntOverflow;
        }
        return new IntRefVal(this._value / BigInt(denominator.value()));
      default:
        return ErrorRefVal.maybeNoSuchOverload(denominator);
    }
  }

  modulo(denominator: RefVal): RefVal {
    switch (denominator.type()) {
      case DoubleType:
      case IntType:
      case UintType:
        if (Number(denominator.value()) === 0) {
          return ErrorRefVal.errModulusByZero;
        }
        // Negating MinInt64 would result in a valid of MaxInt64+1.
        if (this._value === MIN_INT64 && Number(denominator.value()) === -1) {
          return ErrorRefVal.errIntOverflow;
        }
        return new IntRefVal(this._value % BigInt(denominator.value()));
      default:
        return ErrorRefVal.maybeNoSuchOverload(denominator);
    }
  }

  multiply(other: RefVal): RefVal {
    switch (other.type()) {
      case DoubleType:
      case IntType:
      case UintType:
        const x = this.value();
        const y = BigInt(other.value());
        // Detecting multiplication overflow is more complicated than the
        // others. The first two detect attempting to negate MinInt64, which
        // would result in MaxInt64+1. The other four detect normal overflow
        // conditions.
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
          return ErrorRefVal.errIntOverflow;
        }
        return new IntRefVal(x * y);
      default:
        return ErrorRefVal.maybeNoSuchOverload(other);
    }
  }

  negate(): RefVal {
    // Negating MinInt64 would result in a value of MaxInt64+1.
    if (this._value === MIN_INT64) {
      return ErrorRefVal.errIntOverflow;
    }
    return new IntRefVal(-this._value);
  }

  subtract(subtrahend: RefVal): RefVal {
    switch (subtrahend.type()) {
      case DoubleType:
      case IntType:
      case UintType:
        if (
          (subtrahend.value() < 0 &&
            this._value > MAX_INT64 + BigInt(subtrahend.value())) ||
          (subtrahend.value() > 0 &&
            this._value < MIN_INT64 + BigInt(subtrahend.value()))
        ) {
          return ErrorRefVal.errIntOverflow;
        }
        return new IntRefVal(this._value - BigInt(subtrahend.value()));
      default:
        return ErrorRefVal.maybeNoSuchOverload(subtrahend);
    }
  }
}
