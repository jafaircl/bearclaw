/* eslint-disable no-case-declarations */
import { isNil } from '@bearclaw/is';
import {
  Type,
  Type_PrimitiveType,
  Type_WellKnownType,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb.js';
import { DescField, ScalarType } from '@bufbuild/protobuf';
import { Empty } from '@bufbuild/protobuf/wkt';
import { DYN_CEL_TYPE, isDynType } from './dyn';
import { isErrorType } from './error';
import { listType } from './list';
import { mapType } from './map';
import { messageType } from './message';
import { primitiveType } from './primitive';
import { getCheckedWellKnownType } from './wkt';

export function isDynTypeOrErrorType(val: Type): val is Type &
  (
    | {
        typeKind: {
          case: 'error';
          value: Empty;
        };
      }
    | {
        typeKind: {
          case: 'dyn';
          value: Empty;
        };
      }
  ) {
  return isDynType(val) || isErrorType(val);
}

/**
 * Get the CEL type for a field descriptor.
 *
 * @param field the field descriptor
 * @returns the CEL type for the field
 */
export function getFieldDescriptorType(field: DescField) {
  switch (field.fieldKind) {
    case 'message':
      const checkedType = getCheckedWellKnownType(field.message.typeName);
      if (!isNil(checkedType)) {
        return checkedType;
      }
      return messageType(field.message.typeName);
    case 'enum':
      return messageType(field.enum.typeName);
    case 'list':
      switch (field.listKind) {
        case 'message':
          return listType({
            elemType: messageType(field.message.typeName),
          });
        case 'enum':
          return listType({
            elemType: messageType(field.enum.typeName),
          });
        case 'scalar':
          return listType({
            elemType: scalarTypeToPrimitiveType(field.scalar),
          });
        default:
          return DYN_CEL_TYPE;
      }
    case 'scalar':
      return scalarTypeToPrimitiveType(field.scalar);
    case 'map':
      const keyType = scalarTypeToPrimitiveType(field.mapKey);
      switch (field.mapKind) {
        case 'enum':
          return mapType({
            keyType,
            valueType: messageType(field.enum.typeName),
          });
        case 'message':
          return mapType({
            keyType,
            valueType: messageType(field.message.typeName),
          });
        case 'scalar':
          return mapType({
            keyType,
            valueType: scalarTypeToPrimitiveType(field.scalar),
          });
        default:
          return DYN_CEL_TYPE;
      }
    default:
      return DYN_CEL_TYPE;
  }
}

/**
 * Converts a protobuf scalar type to a CEL primitive type.
 *
 * @param scalar the scalar type
 * @returns the CEL primitive type
 */
export function scalarTypeToPrimitiveType(scalar: ScalarType) {
  switch (scalar) {
    case ScalarType.BOOL:
      return primitiveType(Type_PrimitiveType.BOOL);
    case ScalarType.BYTES:
      return primitiveType(Type_PrimitiveType.BYTES);
    case ScalarType.SFIXED32:
    case ScalarType.SFIXED64:
    case ScalarType.FIXED32:
    case ScalarType.FIXED64:
    case ScalarType.FLOAT:
    case ScalarType.DOUBLE:
      return primitiveType(Type_PrimitiveType.DOUBLE);
    case ScalarType.INT32:
    case ScalarType.INT64:
    case ScalarType.SINT32:
    case ScalarType.SINT64:
      return primitiveType(Type_PrimitiveType.INT64);
    case ScalarType.STRING:
      return primitiveType(Type_PrimitiveType.STRING);
    case ScalarType.UINT32:
    case ScalarType.UINT64:
      return primitiveType(Type_PrimitiveType.UINT64);
    default:
      return DYN_CEL_TYPE;
  }
}

/**
 * Converts a CEL WellKnwonType to a string.
 *
 * @param type the WellKnownType
 * @returns a string representation of the WellKnownType (or null if not found)
 */
export function getWellKNownTypeName(type: Type_WellKnownType): string | null {
  switch (type) {
    case Type_WellKnownType.ANY:
      return 'google.protobuf.Any';
    case Type_WellKnownType.DURATION:
      return 'google.protobuf.Duration';
    case Type_WellKnownType.TIMESTAMP:
      return 'google.protobuf.Timestamp';
    default:
      return null;
  }
}

export function typeNameToUrl(name: string): string {
  return `type.googleapis.com/${name}`;
}
