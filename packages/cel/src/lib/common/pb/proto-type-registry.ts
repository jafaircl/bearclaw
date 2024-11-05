/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { isEmpty, isNil } from '@bearclaw/is';
import {
  Type,
  TypeSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb.js';
import {
  Value,
  ValueSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb.js';
import {
  DescEnum,
  DescMessage,
  MutableRegistry,
  Registry,
  create,
  createMutableRegistry,
  isMessage,
} from '@bufbuild/protobuf';
import { formatCELType } from '../format';
import { FieldType } from '../ref/field-type';
import { STANDARD_DESCRIPTORS } from '../standard';
import { BOOL_TYPE, isBoolValue } from '../types/bool';
import { BYTES_TYPE } from '../types/bytes';
import { DOUBLE_TYPE } from '../types/double';
import { enumValue } from '../types/enum';
import { INT64_TYPE } from '../types/int';
import { LIST_TYPE } from '../types/list';
import { MAP_TYPE } from '../types/map';
import { messageType } from '../types/message';
import { NULL_TYPE } from '../types/null';
import { STRING_TYPE } from '../types/string';
import { isZeroValue } from '../types/traits/zeroer';
import { TYPE_TYPE } from '../types/type';
import { UINT64_TYPE } from '../types/uint';
import { getFieldDescriptorType } from '../types/utils';
import { valueOf } from '../types/value';
import { DURATION_TYPE, TIMESTAMP_TYPE } from '../types/wkt';
import { TypeRegistry } from './../ref/registry';

export class ProtoTypeRegistry implements TypeRegistry {
  readonly #refTypeMap = new Map<string, Type>();
  readonly #registry: MutableRegistry;

  constructor(typeMap: Map<string, Type> = new Map(), registry?: Registry) {
    this.#registry = createMutableRegistry(...STANDARD_DESCRIPTORS);
    if (!isNil(registry)) {
      for (const r of registry) {
        this.#registry.add(r);
      }
    }
    this.registerType(
      BOOL_TYPE,
      BYTES_TYPE,
      DOUBLE_TYPE,
      DURATION_TYPE,
      INT64_TYPE,
      LIST_TYPE,
      MAP_TYPE,
      NULL_TYPE,
      STRING_TYPE,
      TIMESTAMP_TYPE,
      TYPE_TYPE,
      UINT64_TYPE
    );
    for (const [k, v] of typeMap) {
      this.#refTypeMap.set(k, v);
    }
  }

  copy(): TypeRegistry {
    return new ProtoTypeRegistry(this.#refTypeMap, this.#registry);
  }

  register(t: Type | DescEnum | DescMessage): void {
    if (isMessage(t, TypeSchema)) {
      this.registerType(t);
    } else {
      this.#registry.add(t);
    }
  }

  registerType(...types: Type[]): void {
    for (const type of types) {
      this.#refTypeMap.set(formatCELType(type), type);
    }
  }

  enumValue(enumName: string) {
    for (const desc of this.#registry) {
      if (desc.kind === 'enum') {
        const v = desc.values.find((v) => v.name === enumName);
        if (!isNil(v)) {
          return enumValue(desc.typeName, v.number);
        }
      }
    }
    return new Error(`unknown enum name '${enumName}'`);
  }

  findIdent(identName: string) {
    if (this.#refTypeMap.has(identName)) {
      return create(ValueSchema, {
        kind: {
          case: 'typeValue',
          value: identName,
        },
      });
    }
    const enumValue = this.enumValue(identName);
    if (!(enumValue instanceof Error)) {
      return enumValue;
    }
    return null;
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
          INT64_TYPE,
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

  newValue(typeName: string, fields: Record<string, Value>): Value | Error {
    const type = this.#registry.getMessage(typeName);
    if (isNil(type)) {
      return new Error(`unknown type '${typeName}'`);
    }
    // TODO: implement
    return create(ValueSchema, {
      kind: {
        case: 'objectValue',
        value: {},
      },
    });
  }

  nativeToValue(value: any) {
    // TODO: this is not correct
    return valueOf(value);
  }
}
