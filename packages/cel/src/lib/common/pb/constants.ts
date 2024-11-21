import {
  Constant,
  ConstantSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';
import { create } from '@bufbuild/protobuf';
import { NullValue } from '@bufbuild/protobuf/wkt';
import { RefVal } from '../ref/reference';
import {
  BoolType,
  BytesType,
  DoubleType,
  IntType,
  NullType,
  StringType,
  UintType,
} from '../types/types';

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
