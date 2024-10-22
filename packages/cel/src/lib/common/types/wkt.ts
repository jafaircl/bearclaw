import {
  Type,
  TypeSchema,
  Type_WellKnownType,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb';
import { create } from '@bufbuild/protobuf';
import { BOOL_TYPE } from './bool';
import { BYTES_TYPE } from './bytes';
import { DOUBLE_TYPE } from './double';
import { DYN_TYPE } from './dyn';
import { INT64_TYPE } from './int';
import { listType } from './list';
import { mapType } from './map';
import { NULL_TYPE } from './null';
import { STRING_TYPE } from './string';
import { UINT64_TYPE } from './uint';

export function wellKnownType(value: Type_WellKnownType) {
  return create(TypeSchema, {
    typeKind: {
      case: 'wellKnown',
      value,
    },
  });
}

export function isWellKnownType(val: Type): val is Type & {
  typeKind: { case: 'wellKnown'; value: Type_WellKnownType };
} {
  return val.typeKind.case === 'wellKnown';
}

export function unwrapWellKnownType(value: Type) {
  if (isWellKnownType(value)) {
    return value.typeKind.value;
  }
  return null;
}

export const ANY_TYPE = wellKnownType(Type_WellKnownType.ANY);
export const DURATION_TYPE = wellKnownType(Type_WellKnownType.DURATION);
export const TIMESTAMP_TYPE = wellKnownType(Type_WellKnownType.TIMESTAMP);

export function isCheckedWellKnownType(type: Type) {
  if (type.typeKind.case !== 'messageType') {
    return false;
  }
  switch (type.typeKind.value) {
    case 'google.protobuf.BoolValue': // Wrapper types.
    case 'google.protobuf.BytesValue':
    case 'google.protobuf.DoubleValue':
    case 'google.protobuf.FloatValue':
    case 'google.protobuf.Int64Value':
    case 'google.protobuf.Int32Value':
    case 'google.protobuf.UInt64Value':
    case 'google.protobuf.UInt32Value':
    case 'google.protobuf.StringValue':
    case 'google.protobuf.Any': // Well-known types.
    case 'google.protobuf.Duration':
    case 'google.protobuf.Timestamp':
    case 'google.protobuf.ListValue': // Json types.
    case 'google.protobuf.NullValue':
    case 'google.protobuf.Struct':
    case 'google.protobuf.Value':
      return true;
    default:
      return false;
  }
}

export function getCheckedWellKnownType(value: string) {
  switch (value) {
    // Wrapper types.
    case 'google.protobuf.BoolValue':
      return BOOL_TYPE;
    case 'google.protobuf.BytesValue':
      return BYTES_TYPE;
    case 'google.protobuf.DoubleValue':
    case 'google.protobuf.FloatValue':
      return DOUBLE_TYPE;
    case 'google.protobuf.Int64Value':
    case 'google.protobuf.Int32Value':
      return INT64_TYPE;
    case 'google.protobuf.UInt64Value':
    case 'google.protobuf.UInt32Value':
      return UINT64_TYPE;
    case 'google.protobuf.StringValue':
      return STRING_TYPE;
    // Well-known types.
    case 'google.protobuf.Any':
      return ANY_TYPE;
    case 'google.protobuf.Duration':
      return DURATION_TYPE;
    case 'google.protobuf.Timestamp':
      return TIMESTAMP_TYPE;
    // Json types.
    case 'google.protobuf.ListValue':
      return listType({ elemType: DYN_TYPE });
    case 'google.protobuf.NullValue':
      return NULL_TYPE;
    case 'google.protobuf.Struct':
      return mapType({ keyType: STRING_TYPE, valueType: DYN_TYPE });
    case 'google.protobuf.Value':
      return DYN_TYPE;
    default:
      return null;
  }
}
