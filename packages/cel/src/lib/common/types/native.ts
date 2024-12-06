/* eslint-disable @typescript-eslint/no-explicit-any */
import { isArray, isMap, isSet } from '@bearclaw/is';
import {
  DescField,
  DescMessage,
  isMessage,
  ScalarType,
} from '@bufbuild/protobuf';
import {
  AnySchema,
  BoolValueSchema,
  BytesValueSchema,
  DoubleValueSchema,
  DurationSchema,
  FloatValueSchema,
  Int32ValueSchema,
  Int64ValueSchema,
  ListValueSchema,
  NullValueSchema,
  StringValueSchema,
  StructSchema,
  TimestampSchema,
  UInt32ValueSchema,
  UInt64ValueSchema,
  ValueSchema,
} from '@bufbuild/protobuf/wkt';

export type ConstructorType<T = any> = new (...args: any[]) => T;

/**
 * Native types that can be used for convertToNative functions
 */
export type NativeType =
  | typeof Boolean
  | typeof Date
  | typeof Map
  | typeof Number
  | typeof String
  | typeof Object
  | typeof Array
  | typeof Set
  | typeof Uint8Array
  | typeof Function
  | typeof Symbol
  | typeof BigInt
  | typeof undefined
  | typeof AnySchema
  | typeof BoolValueSchema
  | typeof BytesValueSchema
  | typeof DoubleValueSchema
  | typeof DurationSchema
  | typeof FloatValueSchema
  | typeof Int32ValueSchema
  | typeof Int64ValueSchema
  | typeof ListValueSchema
  | typeof NullValueSchema
  | typeof StringValueSchema
  | typeof StructSchema
  | typeof TimestampSchema
  | typeof UInt32ValueSchema
  | typeof UInt64ValueSchema
  | typeof ValueSchema
  | DescMessage
  | ConstructorType;

/**
 * ReflectNativeType attempts to reflect the native type of a value.
 */
export function reflectNativeType(value: any): NativeType {
  switch (typeof value) {
    case 'boolean':
      return Boolean;
    case 'number':
      return Number;
    case 'string':
      return String;
    case 'bigint':
      return BigInt;
    case 'symbol':
      return Symbol;
    case 'function':
      return Function;
    case 'object':
      if (isSet(value)) {
        return Set;
      }
      if (isMap(value)) {
        return Map;
      }
      if (isMessage(value)) {
        switch (value.$typeName) {
          case AnySchema.typeName:
            return AnySchema;
          case BoolValueSchema.typeName:
            return BoolValueSchema;
          case BytesValueSchema.typeName:
            return BytesValueSchema;
          case DoubleValueSchema.typeName:
            return DoubleValueSchema;
          case DurationSchema.typeName:
            return DurationSchema;
          case FloatValueSchema.typeName:
            return FloatValueSchema;
          case ListValueSchema.typeName:
            return ListValueSchema;
          case Int32ValueSchema.typeName:
            return Int32ValueSchema;
          case Int64ValueSchema.typeName:
            return Int64ValueSchema;
          case NullValueSchema.typeName:
            return NullValueSchema;
          case StringValueSchema.typeName:
            return StringValueSchema;
          case StructSchema.typeName:
            return StructSchema;
          case TimestampSchema.typeName:
            return TimestampSchema;
          case UInt32ValueSchema.typeName:
            return UInt32ValueSchema;
          case UInt64ValueSchema.typeName:
            return UInt64ValueSchema;
          case ValueSchema.typeName:
            return ValueSchema;
          default:
            break;
        }
      }
      if (value === null) {
        return Object;
      }
      if (isArray(value)) {
        if (value instanceof Uint8Array) {
          return Uint8Array;
        }
        return Array;
      }
      if (value instanceof Date) {
        return Date;
      }
      return value.constructor;
    default:
      return Object;
  }
}

/**
 * ReflectProtoFieldNativeType attempts to reflect the native type of a
 * protobuf field.
 */
export function reflectProtoFieldNativeType(field: DescField): NativeType {
  switch (field.fieldKind) {
    case 'enum':
      return Number;
    case 'list':
      return Array;
    case 'map':
      return Map;
    case 'message':
      return reflectProtoFieldMessageNativeType(field.message);
    case 'scalar':
      return reflectProtoFieldScalarNativeType(field.scalar);
    default:
      throw new Error('unknown field kind');
  }
}

/**
 * ReflectProtoFieldNativeType attempts to reflect the native type of the list
 * elements for a protobuf list field.
 */
export function reflectProtoListElemFieldNativeType(
  field: DescField & { fieldKind: 'list' }
): NativeType {
  switch (field.listKind) {
    case 'enum':
      return Number;
    case 'message':
      return reflectProtoFieldMessageNativeType(field.message);
    case 'scalar':
      return reflectProtoFieldScalarNativeType(field.scalar);
    default:
      throw new Error('unknown list kind');
  }
}

/**
 * ReflectProtoFieldNativeType attempts to reflect the native types of the map
 * key and value for a protobuf map field.
 */
export function reflectProtoMapEntryFieldNativeType(
  field: DescField & { fieldKind: 'map' }
): [NativeType, NativeType] {
  const keyType = reflectProtoFieldScalarNativeType(field.mapKey);
  switch (field.mapKind) {
    case 'enum':
      return [keyType, Number];
    case 'message':
      return [keyType, reflectProtoFieldMessageNativeType(field.message)];
    case 'scalar':
      return [keyType, reflectProtoFieldScalarNativeType(field.scalar)];
    default:
      throw new Error('unknown map kind');
  }
}

function reflectProtoFieldMessageNativeType(message: DescMessage): NativeType {
  switch (message.typeName) {
    case BoolValueSchema.typeName:
      return Boolean;
    case BytesValueSchema.typeName:
      return Uint8Array;
    case Int32ValueSchema.typeName:
    case DoubleValueSchema.typeName:
    case UInt32ValueSchema.typeName:
      return Number;
    case Int64ValueSchema.typeName:
    case UInt64ValueSchema.typeName:
      return BigInt;
    case StringValueSchema.typeName:
      return String;
    default:
      return message;
  }
}

function reflectProtoFieldScalarNativeType(scalar: ScalarType): NativeType {
  switch (scalar) {
    case ScalarType.BOOL:
      return Boolean;
    case ScalarType.BYTES:
      return Uint8Array;
    case ScalarType.DOUBLE:
    case ScalarType.FIXED32:
    case ScalarType.FLOAT:
    case ScalarType.INT32:
    case ScalarType.SFIXED32:
    case ScalarType.SINT32:
    case ScalarType.UINT32:
      return Number;
    case ScalarType.FIXED64:
    case ScalarType.INT64:
    case ScalarType.SFIXED64:
    case ScalarType.SINT64:
    case ScalarType.UINT64:
      return BigInt;
    case ScalarType.STRING:
      return String;
    default:
      throw new Error('unknown scalar type');
  }
}
