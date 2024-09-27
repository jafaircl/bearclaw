import {
  DescEnum,
  DescExtension,
  DescFile,
  DescMessage,
  DescService,
  Registry,
} from '@bufbuild/protobuf';
import {
  AnySchema,
  BoolValueSchema,
  BytesValueSchema,
  DoubleValueSchema,
  FloatValueSchema,
  Int32ValueSchema,
  Int64ValueSchema,
  ListValueSchema,
  ValueSchema as ProtobufValueSchema,
  StringValueSchema,
  StructSchema,
  UInt32ValueSchema,
  UInt64ValueSchema,
} from '@bufbuild/protobuf/wkt';

export const standardTypes: (
  | DescMessage
  | DescEnum
  | Registry
  | DescFile
  | DescExtension
  | DescService
)[] = [
  AnySchema,
  ListValueSchema,
  StructSchema,
  ProtobufValueSchema,
  BoolValueSchema,
  BytesValueSchema,
  DoubleValueSchema,
  FloatValueSchema,
  Int32ValueSchema,
  Int64ValueSchema,
  StringValueSchema,
  UInt32ValueSchema,
  UInt64ValueSchema,
];
