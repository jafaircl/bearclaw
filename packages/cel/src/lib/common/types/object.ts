/* eslint-disable @typescript-eslint/no-explicit-any */
import { isNil } from '@bearclaw/is';
import {
  create,
  DescMessage,
  equals,
  isMessage,
  Message,
} from '@bufbuild/protobuf';
import { anyPack, AnySchema } from '@bufbuild/protobuf/wkt';
import { RefType, RefVal } from '../ref/reference';
import { BoolRefVal } from './bool';
import { ErrorRefVal } from './error';
import { NativeType } from './native';
import { Registry } from './provider';
import { isStringRefVal } from './string';
import { Zeroer } from './traits/zeroer';
import { TypeType } from './types';
import { isMessageFieldSet } from './utils';

export class ObjectRefVal implements RefVal, Zeroer {
  private readonly _value: Message;

  constructor(
    public readonly registry: Registry,
    value: Message,
    public readonly typeDesc: DescMessage,
    public readonly typeValue: RefType
  ) {
    this._value = value;
  }

  convertToNative(type: NativeType) {
    switch (type) {
      case this.typeDesc:
        return this.value();
      case AnySchema:
        return anyPack(this.typeDesc, this.value());
      default:
        return ErrorRefVal.nativeTypeConversionError(this, type);
    }
  }

  convertToType(type: RefType): RefVal {
    if (this.type().typeName() === type.typeName()) {
      return this;
    }
    switch (type) {
      case TypeType:
        return this.type();
      default:
        return ErrorRefVal.typeConversionError(this, type);
    }
  }

  equal(other: RefVal): RefVal {
    const otherValue = other.value();
    if (isMessage(otherValue)) {
      return new BoolRefVal(equals(this.typeDesc, this.value(), otherValue));
    }
    return BoolRefVal.False;
  }

  type(): RefType {
    return this.typeValue;
  }

  value() {
    return this._value;
  }

  isZeroValue(): boolean {
    return isMessageZeroValue(this.typeDesc, this.value());
  }

  isSet(field: RefVal): RefVal {
    if (!isStringRefVal(field)) {
      return ErrorRefVal.maybeNoSuchOverload(field);
    }
    const fd = this.typeDesc.fields.find(
      (f) => f.name === field.value() || f.jsonName === field.value()
    );
    if (isNil(fd)) {
      return ErrorRefVal.noSuchField(field.value());
    }
    return new BoolRefVal(isMessageFieldSet(fd, this.value()));
  }

  get(field: RefVal) {
    if (!isStringRefVal(field)) {
      return ErrorRefVal.maybeNoSuchOverload(field);
    }
    const fd = this.typeDesc.fields.find(
      (f) => f.name === field.value() || f.jsonName === field.value()
    );
    if (isNil(fd)) {
      return ErrorRefVal.noSuchField(field.value());
    }
    return this.registry.nativeToValue(
      (this.value() as any)[fd.name] ?? (this.value() as any)[fd.jsonName]
    );
  }
}

export function isMessageZeroValue(desc: DescMessage, value: Message): boolean {
  return equals(desc, value, create(desc));
}
