import { Value } from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb.js';
import { create } from '@bufbuild/protobuf';
import { ValueSchema } from '@bufbuild/protobuf/wkt';
import { RefType, RefTypeEnum, RefVal } from '../ref/reference';
import { BoolRefVal } from './bool';
import { ErrorRefVal } from './error';
import { NativeType } from './native';
import { TypeValue } from './type';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function unknownValue(value: any) {
  return create(ValueSchema, {
    kind: {
      case: undefined,
      value,
    },
  });
}

export function isUnknownValue(value: Value): value is Value & {
  kind: { case: undefined };
} {
  return value.kind.case === undefined;
}

export const UNKNOWN_REF_TYPE = new TypeValue(RefTypeEnum.UNKNOWN);

/**
 * Unknown type implementation which collects expression ids which caused the
 * current value to become unknown.
 */
export class UnknownRefVal implements RefVal {
  private readonly _value: bigint;

  constructor(value: bigint) {
    this._value = value;
  }

  convertToNative(typeDesc: NativeType) {
    switch (typeDesc) {
      case Number:
        return Number(this._value);
      case BigInt:
        return this._value;
      case String:
        return this._value.toString();
      default:
        return ErrorRefVal.nativeTypeConversionError(this, typeDesc);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  convertToType(typeValue: RefType): RefVal {
    return this;
  }

  equal(other: RefVal): RefVal {
    return new BoolRefVal(this.type().typeName() === other.type().typeName());
  }

  type(): RefType {
    return UNKNOWN_REF_TYPE;
  }

  value() {
    return this._value;
  }
}
