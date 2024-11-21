import {
  Value,
  ValueSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb.js';
import { create } from '@bufbuild/protobuf';
import { NullValue } from '@bufbuild/protobuf/wkt';

/**
 * NewBoolProtoValue creates a new protobuf boolean value.
 */
export function newBoolProtoValue(value: boolean) {
  return create(ValueSchema, {
    kind: {
      case: 'boolValue',
      value,
    },
  });
}

/**
 * IsBoolProtoValue returns true if the value is a protobuf boolean value.
 */
export function isBoolProtoValue(value: Value): value is Value & {
  kind: { case: 'boolValue' };
} {
  return value.kind.case === 'boolValue';
}

/**
 * NewBytesProtoValue creates a new protobuf bytes value.
 */
export function newBytesProtoValue(value: Uint8Array) {
  return create(ValueSchema, {
    kind: {
      case: 'bytesValue',
      value,
    },
  });
}

/**
 * IsBytesProtoValue returns true if the value is a protobuf bytes value.
 */
export function isBytesProtoValue(value: Value): value is Value & {
  kind: { case: 'bytesValue' };
} {
  return value.kind.case === 'bytesValue';
}

/**
 * NewDoubleProtoValue creates a new protobuf double value.
 */
export function newDoubleProtoValue(value: number) {
  return create(ValueSchema, {
    kind: {
      case: 'doubleValue',
      value,
    },
  });
}

/**
 * IsDoubleProtoValue returns true if the value is a protobuf double value.
 */
export function isDoubleProtoValue(value: Value): value is Value & {
  kind: { case: 'doubleValue' };
} {
  return value.kind.case === 'doubleValue';
}

/**
 * NewIntProtoValue creates a new protobuf int64 value.
 */
export function newIntProtoValue(value: bigint) {
  return create(ValueSchema, {
    kind: {
      case: 'int64Value',
      value,
    },
  });
}

/**
 * IsIntProtoValue returns true if the value is a protobuf int64 value.
 */
export function isIntProtoValue(value: Value): value is Value & {
  kind: { case: 'int64Value' };
} {
  return value.kind.case === 'int64Value';
}

export const NullProtoValue = create(ValueSchema, {
  kind: {
    case: 'nullValue',
    value: NullValue.NULL_VALUE,
  },
});

/**
 * IsNullProtoValue returns true if the value is a protobuf null value.
 */
export function isNullProtoValue(value: Value): value is Value & {
  kind: { case: 'nullValue'; value: NullValue };
} {
  return value.kind.case === 'nullValue';
}

/**
 * NewStringProtoValue creates a new protobuf string value.
 */
export function newStringProtoValue(value: string) {
  return create(ValueSchema, {
    kind: {
      case: 'stringValue',
      value,
    },
  });
}

/**
 * IsStringProtoValue returns true if the value is a protobuf string value.
 */
export function isStringProtoValue(value: Value): value is Value & {
  kind: { case: 'stringValue' };
} {
  return value.kind.case === 'stringValue';
}

/**
 * NewUintProtoValue creates a new protobuf uint64 value.
 */
export function newUintProtoValue(value: bigint) {
  return create(ValueSchema, {
    kind: {
      case: 'uint64Value',
      value,
    },
  });
}

/**
 * IsUintProtoValue returns true if the value is a protobuf uint64 value.
 */
export function isUintProtoValue(value: Value): value is Value & {
  kind: { case: 'uint64Value' };
} {
  return value.kind.case === 'uint64Value';
}
