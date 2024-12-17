/* eslint-disable no-case-declarations */
import { create } from '@bufbuild/protobuf';
import { AnySchema, BytesValueSchema, anyPack } from '@bufbuild/protobuf/wkt';
import { RefType, RefVal } from '../ref/reference';
import { BoolRefVal } from './bool';
import { ErrorRefVal } from './error';
import { IntRefVal } from './int';
import { NativeType } from './native';
import { StringRefVal } from './string';
import { Comparer } from './traits/comparer';
import { Adder } from './traits/math';
import { Sizer } from './traits/sizer';
import { Zeroer } from './traits/zeroer';
import { BytesType, StringType, TypeType } from './types';

export class BytesRefVal implements RefVal, Adder, Comparer, Sizer, Zeroer {
  // This has to be a TS private field instead of a # private field because
  // otherwise the tests will not be able to access it to check for equality.
  // TODO: do we want to alter the tests to use the getter instead?
  private readonly _value: Uint8Array;

  constructor(value: Uint8Array) {
    this._value = value;
  }

  convertToNative(type: NativeType) {
    switch (type) {
      case Uint8Array:
        return this._value;
      case AnySchema:
        return anyPack(
          BytesValueSchema,
          create(BytesValueSchema, { value: this._value })
        );
      case BytesValueSchema:
        return create(BytesValueSchema, { value: this._value });
      default:
        return ErrorRefVal.nativeTypeConversionError(this, type);
    }
  }

  convertToType(type: RefType): RefVal {
    switch (type) {
      case BytesType:
        return new BytesRefVal(this._value);
      case StringType:
        return new StringRefVal(new TextDecoder().decode(this._value));
      case TypeType:
        return BytesType;
      default:
        return ErrorRefVal.typeConversionError(this, type);
    }
  }

  equal(other: RefVal): RefVal {
    switch (other.type()) {
      case BytesType:
        const otherValue = (other as BytesRefVal).value();
        if (this._value.length !== otherValue.length) {
          return BoolRefVal.False;
        }
        for (let i = 0; i < this._value.length; i++) {
          if (this._value[i] !== otherValue[i]) {
            return BoolRefVal.False;
          }
        }
        return BoolRefVal.True;
      default:
        return BoolRefVal.False;
    }
  }

  type(): RefType {
    return BytesType;
  }

  value() {
    return this._value;
  }

  add(other: RefVal): RefVal {
    switch (other.type()) {
      case BytesType:
        return new BytesRefVal(
          new Uint8Array([...this._value, ...(other.value() as Uint8Array)])
        );
      default:
        return ErrorRefVal.maybeNoSuchOverload(other);
    }
  }

  compare(other: RefVal): RefVal {
    switch (other.type()) {
      case BytesType:
        if (this._value.length < other.value().length) {
          return IntRefVal.IntNegOne;
        }
        if (this._value.length > other.value().length) {
          return IntRefVal.IntOne;
        }
        for (let i = 0; i < this._value.length; i++) {
          const v = this._value[i];
          const o = other.value()[i];
          if (v < o) {
            return IntRefVal.IntNegOne;
          }
          if (v > o) {
            return IntRefVal.IntOne;
          }
        }
        return IntRefVal.IntZero;
      default:
        return ErrorRefVal.maybeNoSuchOverload(other);
    }
  }

  size(): RefVal {
    return new IntRefVal(BigInt(this._value.length));
  }

  isZeroValue(): boolean {
    return this._value.length === 0;
  }
}
