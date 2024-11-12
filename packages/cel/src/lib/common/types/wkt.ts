import {
  Type,
  TypeSchema,
  Type_WellKnownType,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb';
import { create, createRegistry } from '@bufbuild/protobuf';
import {
  AnySchema,
  DurationSchema,
  TimestampSchema,
} from '@bufbuild/protobuf/wkt';
import { BOOL_CEL_TYPE } from './bool';
import { BYTES_CEL_TYPE } from './bytes';
import { DOUBLE_CEL_TYPE } from './double';
import { DYN_CEL_TYPE } from './dyn';
import { INT_CEL_TYPE } from './int';
import { listType } from './list';
import { mapType } from './map';
import { NULL_CEL_TYPE } from './null';
import { STRING_CEL_TYPE } from './string';
import { UINT_CEL_TYPE } from './uint';

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

export const ANY_WKT_CEL_TYPE = wellKnownType(Type_WellKnownType.ANY);
export const DURATION_WKT_CEL_TYPE = wellKnownType(Type_WellKnownType.DURATION);
export const TIMESTAMP_WKT_CEL_TYPE = wellKnownType(
  Type_WellKnownType.TIMESTAMP
);

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
      return BOOL_CEL_TYPE;
    case 'google.protobuf.BytesValue':
      return BYTES_CEL_TYPE;
    case 'google.protobuf.DoubleValue':
    case 'google.protobuf.FloatValue':
      return DOUBLE_CEL_TYPE;
    case 'google.protobuf.Int64Value':
    case 'google.protobuf.Int32Value':
      return INT_CEL_TYPE;
    case 'google.protobuf.UInt64Value':
    case 'google.protobuf.UInt32Value':
      return UINT_CEL_TYPE;
    case 'google.protobuf.StringValue':
      return STRING_CEL_TYPE;
    // Well-known types.
    case 'google.protobuf.Any':
      return ANY_WKT_CEL_TYPE;
    case 'google.protobuf.Duration':
      return DURATION_WKT_CEL_TYPE;
    case 'google.protobuf.Timestamp':
      return TIMESTAMP_WKT_CEL_TYPE;
    // Json types.
    case 'google.protobuf.ListValue':
      return listType({ elemType: DYN_CEL_TYPE });
    case 'google.protobuf.NullValue':
      return NULL_CEL_TYPE;
    case 'google.protobuf.Struct':
      return mapType({ keyType: STRING_CEL_TYPE, valueType: DYN_CEL_TYPE });
    case 'google.protobuf.Value':
      return DYN_CEL_TYPE;
    default:
      return null;
  }
}

export const WKT_REGISTRY = createRegistry(
  AnySchema,
  DurationSchema,
  TimestampSchema
);
