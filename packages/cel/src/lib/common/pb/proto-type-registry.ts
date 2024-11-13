/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { isEmpty, isNil } from '@bearclaw/is';
import { Type } from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb.js';
import {
  createMutableRegistry,
  DescEnum,
  DescMessage,
  MutableRegistry,
  Registry,
} from '@bufbuild/protobuf';
import { FieldType } from '../ref/field-type';
import { isRefType, RefType, RefTypeEnum, RefVal } from '../ref/reference';
import { STANDARD_DESCRIPTORS } from '../standard';
import { BOOL_REF_TYPE, isBoolValue } from '../types/bool';
import { BYTES_REF_TYPE } from '../types/bytes';
import { DOUBLE_REF_TYPE } from '../types/double';
import { DURATION_REF_TYPE } from '../types/duration';
import { ErrorRefVal } from '../types/error';
import { INT_CEL_TYPE, INT_REF_TYPE, IntRefVal } from '../types/int';
import { messageType } from '../types/message';
import { NULL_REF_TYPE, NullRefVal } from '../types/null';
import { STRING_REF_TYPE } from '../types/string';
import { TIMESTAMP_REF_TYPE } from '../types/timestamp';
import { isZeroValue } from '../types/traits/zeroer';
import { TYPE_REF_TYPE } from '../types/type';
import { UINT_REF_TYPE } from '../types/uint';
import { getFieldDescriptorType } from '../types/utils';
import { TypeRegistry } from './../ref/registry';

export class ProtoTypeRegistry implements TypeRegistry {
  readonly #refTypeMap = new Map<string, RefType>();
  readonly #registry: MutableRegistry;

  constructor(typeMap: Map<string, RefType> = new Map(), registry?: Registry) {
    this.#registry = createMutableRegistry(...STANDARD_DESCRIPTORS);
    if (!isNil(registry)) {
      for (const r of registry) {
        this.#registry.add(r);
      }
    }
    this.registerType(
      BOOL_REF_TYPE,
      BYTES_REF_TYPE,
      DOUBLE_REF_TYPE,
      DURATION_REF_TYPE,
      INT_REF_TYPE,
      // TODO: list and map
      // LIST_CEL_TYPE,
      // MAP_TYPE,
      NULL_REF_TYPE,
      STRING_REF_TYPE,
      TIMESTAMP_REF_TYPE,
      TYPE_REF_TYPE,
      UINT_REF_TYPE
    );
    for (const [k, v] of typeMap) {
      this.#refTypeMap.set(k, v);
    }
  }

  copy(): TypeRegistry {
    return new ProtoTypeRegistry(this.#refTypeMap, this.#registry);
  }

  register(t: RefType | DescEnum | DescMessage): void {
    if (isRefType(t)) {
      this.registerType(t);
    } else {
      this.#registry.add(t);
    }
  }

  registerType(...types: RefType[]): void {
    for (const type of types) {
      this.#refTypeMap.set(type.typeName(), type);
    }
  }

  enumValue(enumName: string) {
    for (const desc of this.#registry) {
      if (desc.kind === 'enum') {
        for (const value of desc.values) {
          if (value.name === enumName) {
            return new IntRefVal(BigInt(value.number));
          }
        }
      }
    }
    return new ErrorRefVal(`unknown enum name '${enumName}'`);
  }

  findIdent(identName: string) {
    if (this.#refTypeMap.has(identName)) {
      return this.#refTypeMap.get(identName)!;
    }
    const enumValue = this.enumValue(identName);
    if (enumValue.type().typeName() === RefTypeEnum.INT) {
      return enumValue;
    }
    return new NullRefVal();
  }

  findType(typeName: string): Type | null {
    if (isNil(this.#registry.get(typeName))) {
      return null;
    }
    if (!isEmpty(typeName) && typeName.charAt(0) == '.') {
      typeName = typeName.substring(1);
    }
    return messageType(typeName);
  }

  findFieldType(messageType: string, fieldName: string): FieldType | Error {
    const desc = this.#registry.get(messageType);
    if (isNil(desc)) {
      return new Error(`unknown type '${messageType}'`);
    }
    switch (desc.kind) {
      case 'enum':
        const enumeration = desc.values.find((v) => v.name === fieldName);
        if (isNil(enumeration)) {
          return new Error(
            `no such field '${fieldName}' on type '${messageType}'`
          );
        }
        return new FieldType(
          INT_CEL_TYPE,
          (obj) => {
            const zero = desc.values.find((v) => v.number === 0);
            return obj.kind.value === zero?.name;
          },
          () => null // TODO: implement
        );
      case 'message':
        const field = desc.fields.find((f) => f.name === fieldName);
        if (isNil(field)) {
          return new Error(
            `no such field '${fieldName}' on type '${messageType}'`
          );
        }
        return new FieldType(
          getFieldDescriptorType(field),
          (obj) => {
            const isZero = isZeroValue(obj);
            if (isZero instanceof Error || !isBoolValue(isZero)) {
              return false;
            }
            return isZero.kind.value;
          },
          () => null // TODO: implement
        );
      default:
        return new Error(`type '${messageType}' is not a message or enum`);
    }
  }

  newValue(typeName: string, fields: Record<string, RefVal>): RefVal {
    const type = this.#registry.getMessage(typeName);
    if (isNil(type)) {
      return new ErrorRefVal(`unknown type '${typeName}'`);
    }
    // TODO: implement
    return new ErrorRefVal('not implemented');
  }

  nativeToValue(value: any) {
    return new ErrorRefVal('not implemented');
  }
}
