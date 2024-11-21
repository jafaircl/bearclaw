/* eslint-disable @typescript-eslint/no-explicit-any */
import { NullValueSchema } from '@bufbuild/protobuf/wkt';
import { RefType, RefVal } from '../ref/reference';
import { BoolRefVal } from './bool';
import { ErrorRefVal } from './error';
import { NativeType } from './native';
import { StringRefVal } from './string';
import { Zeroer } from './traits/zeroer';
import { isType, NullType, StringType, TypeType } from './types';

export class NullRefVal implements RefVal, Zeroer {
  // This has to be a TS private field instead of a # private field because
  // otherwise the tests will not be able to access it to check for equality.
  // TODO: do we want to alter the tests to use the getter instead?
  private readonly _value = null;

  convertToNative(type: NativeType) {
    switch (type) {
      case Object:
        return null;
      // TODO: should we do this?
      case BigInt:
        return BigInt(0);
      // TODO: since NullValueSchema isn't the same as other DescMessage types, we need to figure out how to handle this
      // case AnySchema:
      //   return anyPack(NullValueSchema as unknown as DescMessage, NULL_VALUE);
      case NullValueSchema:
        return new NullRefVal();
      // TODO: cel-go translates to wrapper types.
      default:
        return ErrorRefVal.nativeTypeConversionError(this, type);
    }
  }

  convertToType(type: RefType): RefVal {
    switch (type) {
      case StringType:
        return new StringRefVal('null');
      case NullType:
        return new NullRefVal();
      case TypeType:
        return NullType;
      default:
        return ErrorRefVal.typeConversionError(this, type);
    }
  }

  equal(other: RefVal): RefVal {
    return new BoolRefVal(other.type().typeName() === this.type().typeName());
  }

  type(): RefType {
    return NullType;
  }

  value() {
    return this._value;
  }

  isZeroValue(): boolean {
    return true;
  }
}

export function isNullRefVal(val: any): val is NullRefVal {
  return val && isType(val) && val.type() === NullType;
}
