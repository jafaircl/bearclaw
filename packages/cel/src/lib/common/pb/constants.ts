import {
  Constant,
  ConstantSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';
import { create } from '@bufbuild/protobuf';
import { NullValue } from '@bufbuild/protobuf/wkt';
import { RefVal } from '../ref/reference';
import { BoolRefVal } from '../types/bool';
import { BytesRefVal } from '../types/bytes';
import { DoubleRefVal } from '../types/double';
import { DurationRefVal } from '../types/duration';
import { IntRefVal } from '../types/int';
import { NullRefVal } from '../types/null';
import { StringRefVal } from '../types/string';
import { TimestampRefVal } from '../types/timestamp';
import {
  BoolType,
  BytesType,
  DoubleType,
  DurationType,
  IntType,
  NullType,
  StringType,
  TimestampType,
  Type,
  UintType,
} from '../types/types';
import { UintRefVal } from '../types/uint';

/**
 * NewBoolProtoConstant creates a new protobuf boolean constant.
 */
export function newBoolProtoConstant(value: boolean) {
  return create(ConstantSchema, {
    constantKind: {
      case: 'boolValue',
      value,
    },
  });
}

/**
 * IsBoolProtoConstant returns true if the constant is a protobuf boolean
 * constant.
 */
export function isBoolProtoConstant(value: Constant): value is Constant & {
  constantKind: { case: 'boolValue' };
} {
  return value.constantKind.case === 'boolValue';
}

/**
 * NewBytesProtoConstant creates a new protobuf bytes constant.
 */
export function newBytesProtoConstant(value: Uint8Array) {
  return create(ConstantSchema, {
    constantKind: {
      case: 'bytesValue',
      value,
    },
  });
}

/**
 * IsBytesProtoConstant returns true if the constant is a protobuf bytes
 */
export function isBytesProtoConstant(value: Constant): value is Constant & {
  constantKind: { case: 'bytesValue' };
} {
  return value.constantKind.case === 'bytesValue';
}

/**
 * NewDoubleProtoConstant creates a new protobuf double constant.
 */
export function newDoubleProtoConstant(value: number) {
  return create(ConstantSchema, {
    constantKind: {
      case: 'doubleValue',
      value,
    },
  });
}

/**
 * IsDoubleProtoConstant returns true if the constant is a protobuf double
 */
export function isDoubleProtoConstant(value: Constant): value is Constant & {
  constantKind: { case: 'doubleValue' };
} {
  return value.constantKind.case === 'doubleValue';
}

/**
 * NewIntProtoConstant creates a new protobuf int64 constant.
 */
export function newIntProtoConstant(value: bigint) {
  return create(ConstantSchema, {
    constantKind: {
      case: 'int64Value',
      value,
    },
  });
}

/**
 * IsIntProtoConstant returns true if the constant is a protobuf int64
 */
export function isIntProtoConstant(value: Constant): value is Constant & {
  constantKind: { case: 'int64Value' };
} {
  return value.constantKind.case === 'int64Value';
}

export const NullProtoConstant = create(ConstantSchema, {
  constantKind: {
    case: 'nullValue',
    value: NullValue.NULL_VALUE,
  },
});

/**
 * IsNullProtoConstant returns true if the constant is a protobuf null
 */
export function isNullProtoConstant(value: Constant): value is Constant & {
  constantKind: { case: 'nullValue'; value: NullValue };
} {
  return value.constantKind.case === 'nullValue';
}

/**
 * NewStringProtoConstant creates a new protobuf string constant.
 */
export function newStringProtoConstant(value: string) {
  return create(ConstantSchema, {
    constantKind: {
      case: 'stringValue',
      value,
    },
  });
}

/**
 * IsStringProtoConstant returns true if the constant is a protobuf string
 */
export function isStringProtoConstant(value: Constant): value is Constant & {
  constantKind: { case: 'stringValue' };
} {
  return value.constantKind.case === 'stringValue';
}

/**
 * NewUintProtoConstant creates a new protobuf uint64 constant.
 */
export function newUintProtoConstant(value: bigint) {
  return create(ConstantSchema, {
    constantKind: {
      case: 'uint64Value',
      value,
    },
  });
}

/**
 * IsUintProtoConstant returns true if the constant is a protobuf uint64
 */
export function isUintProtoConstant(value: Constant): value is Constant & {
  constantKind: { case: 'uint64Value' };
} {
  return value.constantKind.case === 'uint64Value';
}

/**
 * RefValToProtoConstant converts a ref.Val to a protobuf constant.
 */
export function refValToProtoConstant(value: RefVal): Constant {
  switch (value.type()) {
    case BoolType:
      return newBoolProtoConstant(value.value() as boolean);
    case BytesType:
      return newBytesProtoConstant(value.value() as Uint8Array);
    case DoubleType:
      return newDoubleProtoConstant(value.value() as number);
    case IntType:
      return newIntProtoConstant(value.value() as bigint);
    case NullType:
      return NullProtoConstant;
    case StringType:
      return newStringProtoConstant(value.value() as string);
    case UintType:
      return newUintProtoConstant(value.value() as bigint);
    default:
      throw new Error(`unsupported ref.Val type: ${value.type()}`);
  }
}

/**
 * ProtoConstantToRefVal converts a protobuf constant to a ref.Val.
 */
export function protoConstantToRefVal(value: Constant): RefVal {
  switch (value.constantKind.case) {
    case 'boolValue':
      return new BoolRefVal(value.constantKind.value);
    case 'bytesValue':
      return new BytesRefVal(value.constantKind.value);
    case 'doubleValue':
      return new DoubleRefVal(value.constantKind.value);
    case 'durationValue':
      return new DurationRefVal(value.constantKind.value);
    case 'int64Value':
      return new IntRefVal(value.constantKind.value);
    case 'nullValue':
      return new NullRefVal();
    case 'stringValue':
      return new StringRefVal(value.constantKind.value);
    case 'timestampValue':
      return new TimestampRefVal(value.constantKind.value);
    case 'uint64Value':
      return new UintRefVal(value.constantKind.value);
    default:
      throw new Error(`unsupported constant kind: ${value.constantKind.case}`);
  }
}

/**
 * ProtoConstantToType converts a protobuf constant to a type.
 */
export function protoConstantToType(value: Constant): Type {
  switch (value.constantKind.case) {
    case 'boolValue':
      return BoolType;
    case 'bytesValue':
      return BytesType;
    case 'doubleValue':
      return DoubleType;
    case 'durationValue':
      return DurationType;
    case 'int64Value':
      return IntType;
    case 'nullValue':
      return NullType;
    case 'stringValue':
      return StringType;
    case 'timestampValue':
      return TimestampType;
    case 'uint64Value':
      return UintType;
    default:
      throw new Error(`unsupported constant kind: ${value.constantKind.case}`);
  }
}
