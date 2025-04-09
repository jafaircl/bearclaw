/* eslint-disable no-case-declarations */
import {
  Type,
  Type_PrimitiveType,
  Type_WellKnownType,
  TypeSchema,
} from '@buf/googleapis_googleapis.bufbuild_es/google/api/expr/v1alpha1/checked_pb.js';
import { create, DescField, ScalarType } from '@bufbuild/protobuf';

// Primitive types.
export const TypeInt = create(TypeSchema, {
  typeKind: { case: 'primitive', value: Type_PrimitiveType.INT64 },
});
export const TypeFloat = create(TypeSchema, {
  typeKind: { case: 'primitive', value: Type_PrimitiveType.DOUBLE },
});
export const TypeString = create(TypeSchema, {
  typeKind: { case: 'primitive', value: Type_PrimitiveType.STRING },
});
export const TypeBool = create(TypeSchema, {
  typeKind: { case: 'primitive', value: Type_PrimitiveType.BOOL },
});

/**
 * TypeMap returns the type for a map with the provided key and value types.
 */
export function typeMap(keyType: Type, valueType: Type) {
  return create(TypeSchema, {
    typeKind: {
      case: 'mapType',
      value: {
        keyType,
        valueType,
      },
    },
  });
}

/**
 * TypeList returns the type for a list with the provided element type.
 */
export function typeList(elemType: Type) {
  return create(TypeSchema, {
    typeKind: {
      case: 'listType',
      value: {
        elemType,
      },
    },
  });
}

/**
 * TypeEnum returns the type of a protobuf enum.
 */
export function typeEnum(enumName: string) {
  return create(TypeSchema, {
    typeKind: {
      case: 'messageType',
      value: enumName,
    },
  });
}

/**
 * TypeMessage returns the type of a protobuf message.
 */
export function typeMessage(messageName: string) {
  return create(TypeSchema, {
    typeKind: {
      case: 'messageType',
      value: messageName,
    },
  });
}

/**
 * Get the Type for a scalar type.
 */
export function getScalarType(scalar: ScalarType) {
  switch (scalar) {
    case ScalarType.BOOL:
      return TypeBool;
    case ScalarType.INT32:
    case ScalarType.INT64:
    case ScalarType.SINT32:
    case ScalarType.SINT64:
    case ScalarType.UINT32:
    case ScalarType.UINT64:
      return TypeInt;
    case ScalarType.DOUBLE:
    case ScalarType.FIXED32:
    case ScalarType.FIXED64:
    case ScalarType.FLOAT:
    case ScalarType.SFIXED32:
    case ScalarType.SFIXED64:
      return TypeFloat;
    case ScalarType.STRING:
      return TypeString;
    default:
      return null;
  }
}

/**
 * Get the Type for a field descriptor.
 */
export function getFieldType(field: DescField) {
  switch (field.fieldKind) {
    case 'enum':
      return typeEnum(field.enum.typeName);
    case 'list':
      switch (field.listKind) {
        case 'enum':
          return typeEnum(field.enum.typeName);
        case 'message':
          return typeMessage(field.message.typeName);
        case 'scalar':
          return getScalarType(field.scalar);
        default:
          return null;
      }
    case 'map':
      const keyType = getScalarType(field.mapKey);
      if (!keyType) {
        return null;
      }
      switch (field.mapKind) {
        case 'enum':
          return typeMap(keyType, typeEnum(field.enum.typeName));
        case 'message':
          return typeMap(keyType, typeMessage(field.message.typeName));
        case 'scalar':
          const fieldType = getScalarType(field.scalar);
          if (!fieldType) {
            return null;
          }
          return typeMap(keyType, fieldType);
        default:
          return null;
      }
    case 'message':
      return typeMessage(field.message.typeName);
    case 'scalar':
      return getScalarType(field.scalar);
    default:
      return null;
  }
}

// Well-known types.
export const TypeDuration = create(TypeSchema, {
  typeKind: { case: 'wellKnown', value: Type_WellKnownType.DURATION },
});
export const TypeTimestamp = create(TypeSchema, {
  typeKind: { case: 'wellKnown', value: Type_WellKnownType.TIMESTAMP },
});
