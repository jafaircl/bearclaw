/* eslint-disable no-case-declarations */
import { create } from '@bufbuild/protobuf';
import {
  AnySchema,
  UInt32ValueSchema,
  UInt64ValueSchema,
  anyPack,
} from '@bufbuild/protobuf/wkt';
import { RefType, RefVal } from './../ref/reference';
import { BoolRefVal } from './bool';
import { compareNumberRefVals } from './compare';
import { DoubleRefVal } from './double';
import { ErrorRefVal } from './error';
import { IntRefVal, MAX_INT64 } from './int';
import { NativeType } from './native';
import { StringRefVal } from './string';
import { Comparer } from './traits/comparer';
import { Adder, Divider, Modder, Multiplier, Subtractor } from './traits/math';
import { Zeroer } from './traits/zeroer';
import {
  DoubleType,
  ErrorType,
  IntType,
  StringType,
  TypeType,
  UintType,
} from './types';

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

export class UintRefVal
  implements
    RefVal,
    Adder,
    Comparer,
    Divider,
    Modder,
    Multiplier,
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

  convertToNative(type: NativeType) {
    switch (type) {
      case BigInt:
        return this._value;
      case Number:
        return Number(this._value);
      case AnySchema:
        return anyPack(
          UInt64ValueSchema,
          create(UInt64ValueSchema, { value: this._value })
        );
      case UInt32ValueSchema:
        if (!isValidUint32(Number(this._value))) {
          return ErrorRefVal.errUintOverflow;
        }
        return create(UInt32ValueSchema, { value: Number(this._value) });
      case UInt64ValueSchema:
        if (!isValidUint64(this._value)) {
          return ErrorRefVal.errUintOverflow;
        }
        return create(UInt64ValueSchema, { value: this._value });
      default:
        return ErrorRefVal.nativeTypeConversionError(this, type);
    }
  }

  convertToType(type: RefType): RefVal {
    switch (type) {
      case DoubleType:
        return new DoubleRefVal(Number(this._value));
      case IntType:
        if (Number.isNaN(this._value) || !isValidUint64(this._value)) {
          return ErrorRefVal.errIntOverflow;
        }
        return new IntRefVal(this._value);
      case StringType:
        return new StringRefVal(this._value.toString());
      case TypeType:
        return UintType;
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
    if (Number.isNaN(this._value) || Number.isNaN(other.value())) {
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
    return UintType;
  }

  value() {
    return this._value;
  }

  add(other: RefVal): RefVal {
    switch (other.type()) {
      case DoubleType:
      case IntType:
      case UintType:
        if (
          (other.value() > 0 &&
            this._value > MAX_INT64 - BigInt(other.value())) ||
          (other.value() < 0 && this._value < Math.abs(Number(other.value())))
        ) {
          return ErrorRefVal.errUintOverflow;
        }
        return new UintRefVal(this._value + BigInt(other.value()));
      default:
        return ErrorRefVal.maybeNoSuchOverload(other);
    }
  }

  compare(other: RefVal): RefVal {
    if (
      Number.isNaN(Number(this._value)) ||
      Number.isNaN(Number(other?.value()))
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
        return new UintRefVal(this._value / BigInt(denominator.value()));
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
        return new UintRefVal(this._value % BigInt(denominator.value()));
      default:
        return ErrorRefVal.maybeNoSuchOverload(denominator);
    }
  }

  multiply(other: RefVal): RefVal {
    switch (other.type()) {
      case DoubleType:
      case IntType:
      case UintType:
        const x = this._value;
        const y = BigInt(other.value());
        // Detecting multiplication overflow is more complicated than the
        // others. The first two detect attempting to negate MinUint64, which
        // would result in MaxUint64+1. The other four detect normal overflow
        // conditions.
        if (y !== BigInt(0) && x > MAX_INT64 / y) {
          return ErrorRefVal.errUintOverflow;
        }
        return new UintRefVal(x * y);
      default:
        return ErrorRefVal.maybeNoSuchOverload(other);
    }
  }

  subtract(subtrahend: RefVal): RefVal {
    switch (subtrahend.type()) {
      case DoubleType:
      case IntType:
      case UintType:
        if (subtrahend.value() > this._value) {
          return ErrorRefVal.errUintOverflow;
        }
        const result = this._value - BigInt(subtrahend.value());
        if (result < BigInt(0) || result > MAX_INT64) {
          return ErrorRefVal.errUintOverflow;
        }
        return new UintRefVal(result);
      default:
        return ErrorRefVal.maybeNoSuchOverload(subtrahend);
    }
  }

  isZeroValue(): boolean {
    return this._value === BigInt(0);
  }
}
