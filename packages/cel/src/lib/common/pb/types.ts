import { isNil } from '@bearclaw/is';
import { create } from '@bufbuild/protobuf';
import { NullValue } from '@bufbuild/protobuf/wkt';
import {
  Type,
  Type_PrimitiveType,
  Type_WellKnownType,
  TypeSchema,
} from '../../protogen/cel/expr/checked_pb.js';

/**
 * ErrorProtoType represents a protobuf CEL error type.
 */
export const ErrorProtoType = create(TypeSchema, {
  typeKind: {
    case: 'error',
    value: {},
  },
});

/**
 * IsErrorProtoType returns true if the type is an error protobuf type.
 */
export function isErrorProtoType(type: Type): type is Type & {
  typeKind: { case: 'error' };
} {
  return type.typeKind.case === 'error';
}

/**
 * DynProtoType represents a dynamic protobuf CEL type.
 */
export const DynProtoType = create(TypeSchema, {
  typeKind: {
    case: 'dyn',
    value: {},
  },
});

/**
 * IsDynProtoType returns true if the type is a dynamic protobuf type.
 */
export function isDynProtoType(type: Type): type is Type & {
  typeKind: { case: 'dyn' };
} {
  return type.typeKind.case === 'dyn';
}

/**
 * BoolProtoType represents a protobuf CEL boolean type.
 */
export const BoolProtoType = newPrimitiveProtoType(Type_PrimitiveType.BOOL);

/**
 * IsBoolProtoType returns true if the type is a boolean protobuf type.
 */
export function isBoolProtoType(type: Type): type is Type & {
  typeKind: { case: 'primitive'; value: Type_PrimitiveType.BOOL };
} {
  return (
    type.typeKind.case === 'primitive' &&
    type.typeKind.value === Type_PrimitiveType.BOOL
  );
}

/**
 * BytesProtoType represents a protobuf CEL bytes type.
 */
export const BytesProtoType = newPrimitiveProtoType(Type_PrimitiveType.BYTES);

/**
 * IsBytesProtoType returns true if the type is a bytes protobuf type.
 */
export function isBytesProtoType(type: Type): type is Type & {
  typeKind: { case: 'primitive'; value: Type_PrimitiveType.BYTES };
} {
  return (
    type.typeKind.case === 'primitive' &&
    type.typeKind.value === Type_PrimitiveType.BYTES
  );
}

/**
 * DoubleProtoType represents a protobuf CEL double type.
 */
export const DoubleProtoType = newPrimitiveProtoType(Type_PrimitiveType.DOUBLE);

/**
 * IsDoubleProtoType returns true if the type is a double protobuf type.
 */
export function isDoubleProtoType(type: Type): type is Type & {
  typeKind: { case: 'primitive'; value: Type_PrimitiveType.DOUBLE };
} {
  return (
    type.typeKind.case === 'primitive' &&
    type.typeKind.value === Type_PrimitiveType.DOUBLE
  );
}

/**
 * IntProtoType represents a protobuf CEL int type.
 */
export const IntProtoType = newPrimitiveProtoType(Type_PrimitiveType.INT64);

/**
 * IsIntProtoType returns true if the type is an int protobuf type.
 */
export function isIntProtoType(type: Type): type is Type & {
  typeKind: { case: 'primitive'; value: Type_PrimitiveType.INT64 };
} {
  return (
    type.typeKind.case === 'primitive' &&
    type.typeKind.value === Type_PrimitiveType.INT64
  );
}

/**
 * NullProtoType represents a protobuf CEL null type.
 */
export const NullProtoType = create(TypeSchema, {
  typeKind: {
    case: 'null',
    value: NullValue.NULL_VALUE,
  },
});

/**
 * IsNullProtoType returns true if the type is a null protobuf type.
 */
export function isNullProtoType(type: Type): type is Type & {
  typeKind: { case: 'null'; value: NullValue };
} {
  return type.typeKind.case === 'null';
}

/**
 * StringProtoType represents a protobuf CEL string type.
 */
export const StringProtoType = newPrimitiveProtoType(Type_PrimitiveType.STRING);

/**
 * IsStringProtoType returns true if the type is a string protobuf type.
 */
export function isStringProtoType(type: Type): type is Type & {
  typeKind: { case: 'primitive'; value: Type_PrimitiveType.STRING };
} {
  return (
    type.typeKind.case === 'primitive' &&
    type.typeKind.value === Type_PrimitiveType.STRING
  );
}

/**
 * UintProtoType represents a protobuf CEL uint type.
 */
export const UintProtoType = newPrimitiveProtoType(Type_PrimitiveType.UINT64);

/**
 * IsUintProtoType returns true if the type is a uint protobuf type.
 */
export function isUintProtoType(type: Type): type is Type & {
  typeKind: { case: 'primitive'; value: Type_PrimitiveType.UINT64 };
} {
  return (
    type.typeKind.case === 'primitive' &&
    type.typeKind.value === Type_PrimitiveType.UINT64
  );
}

/**
 * AnyProtoType represents a 'google.protobuf.Any' protobuf CEL type.
 */
export const AnyProtoType = newWellKnownProtoType(Type_WellKnownType.ANY);

/**
 * IsAnyProtoType returns true if the type is a 'google.protobuf.Any' protobuf
 * CEL type.
 */
export function isAnyProtoType(type: Type): type is Type & {
  typeKind: { case: 'wellKnown'; value: Type_WellKnownType.ANY };
} {
  return (
    type.typeKind.case === 'wellKnown' &&
    type.typeKind.value === Type_WellKnownType.ANY
  );
}

/**
 * DurationProtoType represents a 'google.protobuf.Duration' protobuf CEL type.
 */
export const DurationProtoType = newWellKnownProtoType(
  Type_WellKnownType.DURATION
);

/**
 * IsDurationProtoType returns true if the type is a 'google.protobuf.Duration'
 * protobuf CEL type.
 */
export function isDurationProtoType(type: Type): type is Type & {
  typeKind: { case: 'wellKnown'; value: Type_WellKnownType.DURATION };
} {
  return (
    type.typeKind.case === 'wellKnown' &&
    type.typeKind.value === Type_WellKnownType.DURATION
  );
}

/**
 * TimestampProtoType represents a 'google.protobuf.Timestamp' protobuf CEL
 * type.
 */
export const TimestampProtoType = newWellKnownProtoType(
  Type_WellKnownType.TIMESTAMP
);

/**
 * IsTimestampProtoType returns true if the type is a
 * 'google.protobuf.Timestamp' protobuf CEL type.
 */
export function isTimestampProtoType(type: Type): type is Type & {
  typeKind: { case: 'wellKnown'; value: Type_WellKnownType.TIMESTAMP };
} {
  return (
    type.typeKind.case === 'wellKnown' &&
    type.typeKind.value === Type_WellKnownType.TIMESTAMP
  );
}

/**
 * NewAbstractType creates an abstract type declaration which references a
 * proto message name and may also include type parameters.
 */
export function newAbstractProtoType(name: string, ...parameterTypes: Type[]) {
  return create(TypeSchema, {
    typeKind: {
      case: 'abstractType',
      value: {
        name,
        parameterTypes,
      },
    },
  });
}

/**
 * NewOptionalType constructs an abstract type indicating that the
 * parameterized type may be contained within the object.
 */
export function newOptionalProtoType(paramType: Type) {
  return newAbstractProtoType('optional_type', paramType);
}

/**
 * NewFunctionType creates a function invocation contract, typically only used
 * by type-checking steps after overload resolution.
 */
export function newFunctionProtoType(resultType: Type, ...argTypes: Type[]) {
  return create(TypeSchema, {
    typeKind: {
      case: 'function',
      value: {
        resultType,
        argTypes,
      },
    },
  });
}

/**
 * IsFunctionType returns true if the type is a function proto type.
 */
export function isFunctionProtoType(type: Type): type is Type & {
  typeKind: {
    case: 'function';
    value: {
      resultType: Type;
      argTypes: Type[];
    };
  };
} {
  return type.typeKind.case === 'function';
}

/**
 * NewListType generates a new list with elements of a certain type.
 */
export function newListProtoType(elemType: Type) {
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
 * NewMapType generates a new map with typed keys and values.
 */
export function newMapProtoType(keyType: Type, valueType: Type) {
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
 * NewObjectType creates an object type for a qualified type name.
 */
export function newObjectProtoType(typeName: string) {
  return create(TypeSchema, {
    typeKind: {
      case: 'messageType',
      value: typeName,
    },
  });
}

/**
 * NewPrimitiveType creates a type for a primitive value. See the var
 * declarations for Int, Uint, etc.
 */
export function newPrimitiveProtoType(value: Type_PrimitiveType) {
  return create(TypeSchema, {
    typeKind: {
      case: 'primitive',
      value,
    },
  });
}

/**
 * NewTypeType creates a new type designating a type.
 */
export function newTypeProtoType(type?: Type) {
  if (isNil(type)) {
    type = create(TypeSchema);
  }
  return create(TypeSchema, {
    typeKind: {
      case: 'type',
      value: type,
    },
  });
}

/**
 * NewTypeParamType creates a type corresponding to a named, contextual
 * parameter.
 */
export function newTypeParamProtoType(name: string) {
  return create(TypeSchema, {
    typeKind: {
      case: 'typeParam',
      value: name,
    },
  });
}

/**
 * NewWellKnownType creates a type corresponding to a protobuf well-known type
 * value.
 */
export function newWellKnownProtoType(value: Type_WellKnownType) {
  return create(TypeSchema, {
    typeKind: {
      case: 'wellKnown',
      value,
    },
  });
}

/**
 * NewWrapperType creates a wrapped primitive type instance. Wrapped types are
 * roughly equivalent to a nullable, or optionally valued type.
 */
export function newWrapperProtoType(type: Type) {
  if (type.typeKind.case !== 'primitive') {
    throw new Error('Wrapped type must be a primitive');
  }
  return create(TypeSchema, {
    typeKind: {
      case: 'wrapper',
      value: type.typeKind.value,
    },
  });
}

export function isDynOrErrorProtoType(type: Type): type is Type & {
  typeKind: { case: 'dyn' } | { case: 'error' };
} {
  return isDynProtoType(type) || isErrorProtoType(type);
}
