/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { isNil } from '@bearclaw/is';
import { isRefVal, RefType, RefVal } from '../ref/reference';
import { BoolRefVal } from './bool';
import { ErrorRefVal } from './error';
import { NativeType } from './native';
import { newOpaqueType, TypeType } from './types';

/**
 * OptionalType indicates the runtime type of an optional value.
 */
export const OptionalType = newOpaqueType('optional_type');

/**
 * Optional value which points to a value if non-empty.
 */
export class OptionalRefVal<T extends RefVal = RefVal> implements RefVal {
  private _value?: T;

  constructor(_value?: T) {
    this._value = _value;
  }

  /**
   * HasValue returns true if the optional has a value.
   */
  hasValue(): boolean {
    return !isNil(this._value);
  }

  /**
   * GetValue returns the wrapped value contained in the optional.
   */
  getValue(): T | ErrorRefVal {
    if (!this.hasValue()) {
      return new ErrorRefVal('optional.none() dereference');
    }
    return this._value!;
  }

  convertToNative(type: NativeType) {
    if (!this.hasValue()) {
      return new ErrorRefVal('optional.none() dereference');
    }
    return this._value?.convertToNative(type);
  }

  convertToType(type: RefType): RefVal {
    switch (type) {
      case OptionalType:
        return this;
      case TypeType:
        return OptionalType;
      default:
        return ErrorRefVal.typeConversionError(type, OptionalType);
    }
  }

  equal(other: RefVal): RefVal {
    if (!isRefVal(other)) {
      return BoolRefVal.False;
    }
    if (other.type() !== OptionalType) {
      return ErrorRefVal.maybeNoSuchOverload(other);
    }
    if (!this.hasValue()) {
      return new BoolRefVal(!(other as OptionalRefVal).hasValue());
    }
    if (!(other as OptionalRefVal).hasValue()) {
      return BoolRefVal.False;
    }
    return this._value!.equal((other as OptionalRefVal)._value!);
  }

  type(): RefType {
    return OptionalType;
  }

  value() {
    return this._value?.value() ?? null;
  }
}

/**
 * OptionalNone is a sentinel value which is used to indicate an empty optional
 * value.
 */
export const OptionalNone = new OptionalRefVal();

export function isOptionalRefVal(value: any): value is OptionalRefVal {
  if (!isRefVal(value)) {
    return false;
  }
  return value.type() === OptionalType;
}
