/* eslint-disable no-case-declarations */
import { create } from '@bufbuild/protobuf';
import {
  AnySchema,
  DoubleValueSchema,
  FloatValueSchema,
  anyPack,
} from '@bufbuild/protobuf/wkt';
import { RefType, RefVal } from '../ref/reference';
import { BoolRefVal } from './bool';
import { compareNumberRefVals } from './compare';
import { ErrorRefVal } from './error';
import { IntRefVal, isValidInt64 } from './int';
import { NativeType } from './native';
import { StringRefVal } from './string';
import { Comparer } from './traits/comparer';
import { Adder, Divider, Multiplier, Negater, Subtractor } from './traits/math';
import { Zeroer } from './traits/zeroer';
import {
  DoubleType,
  ErrorType,
  IntType,
  StringType,
  TypeType,
  UintType,
} from './types';
import { UintRefVal, isValidUint64 } from './uint';
export class DoubleRefVal
  implements
    RefVal,
    Adder,
    Comparer,
    Divider,
    Multiplier,
    Negater,
    Subtractor,
    Zeroer
{
  // This has to be a TS private field instead of a # private field because
  // otherwise the tests will not be able to access it to check for equality.
  // TODO: do we want to alter the tests to use the getter instead?
  private readonly _value: number;

  constructor(value: number) {
    this._value = value;
  }

  convertToNative(type: NativeType) {
    switch (type) {
      case Number:
        return this._value;
      case AnySchema:
        return anyPack(
          DoubleValueSchema,
          create(DoubleValueSchema, { value: this._value })
        );
      case DoubleValueSchema:
        return create(DoubleValueSchema, { value: this._value });
      case FloatValueSchema:
        return create(FloatValueSchema, { value: this._value });
      default:
        return ErrorRefVal.nativeTypeConversionError(this, type);
    }
  }

  convertToType(type: RefType): RefVal {
    switch (type) {
      case DoubleType:
        return new DoubleRefVal(this._value);
      case IntType:
        if (
          Number.isNaN(this._value) ||
          this._value >= Infinity ||
          this._value <= -Infinity ||
          !isValidInt64(BigInt(this._value))
        ) {
          return ErrorRefVal.errIntOverflow;
        }
        return new IntRefVal(BigInt(this._value));
      case StringType:
        return new StringRefVal(this._value.toString());
      case TypeType:
        return DoubleType;
      case UintType:
        if (
          Number.isNaN(this.value()) ||
          this.value() >= Infinity ||
          !isValidUint64(BigInt(this.value()))
        ) {
          return ErrorRefVal.errUintOverflow;
        }
        return new UintRefVal(BigInt(this.value()));
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
    return DoubleType;
  }

  value() {
    return this._value;
  }

  add(other: RefVal): RefVal {
    switch (other.type()) {
      case DoubleType:
      case IntType:
      case UintType:
        return new DoubleRefVal(this._value + Number(other.value()));
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
        return new DoubleRefVal(this._value / Number(denominator.value()));
      default:
        return ErrorRefVal.maybeNoSuchOverload(denominator);
    }
  }

  multiply(other: RefVal): RefVal {
    switch (other.type()) {
      case DoubleType:
      case IntType:
      case UintType:
        return new DoubleRefVal(this._value * Number(other.value()));
      default:
        return ErrorRefVal.maybeNoSuchOverload(other);
    }
  }

  negate(): RefVal {
    return new DoubleRefVal(-this._value);
  }

  subtract(subtrahend: RefVal): RefVal {
    switch (subtrahend.type()) {
      case DoubleType:
      case IntType:
      case UintType:
        return new DoubleRefVal(this._value - Number(subtrahend.value()));
      default:
        return ErrorRefVal.maybeNoSuchOverload(subtrahend);
    }
  }

  isZeroValue(): boolean {
    return this._value === 0;
  }
}
