import {
  AnySchema,
  BoolValueSchema,
  BytesValueSchema,
  DoubleValueSchema,
  DurationSchema,
  FloatValueSchema,
  Int32ValueSchema,
  Int64ValueSchema,
  StringValueSchema,
  StructSchema,
  TimestampSchema,
  UInt64ValueSchema,
} from '@bufbuild/protobuf/wkt';

/**
 * Native types that can be used for convertToNative functions
 */
export type NativeType =
  | typeof Boolean
  | typeof Number
  | typeof String
  | typeof Object
  | typeof Array
  | typeof Uint8Array
  | typeof Function
  | typeof Symbol
  | typeof BigInt
  | typeof AnySchema
  | typeof BoolValueSchema
  | typeof BytesValueSchema
  | typeof DoubleValueSchema
  | typeof DurationSchema
  | typeof FloatValueSchema
  | typeof Int32ValueSchema
  | typeof Int64ValueSchema
  | typeof StringValueSchema
  | typeof StructSchema
  | typeof TimestampSchema
  | typeof UInt64ValueSchema;
