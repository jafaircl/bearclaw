/* eslint-disable @typescript-eslint/no-explicit-any */
import { isArray, isMap, isSet } from '@bearclaw/is';
import { DescMessage, isMessage } from '@bufbuild/protobuf';
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
