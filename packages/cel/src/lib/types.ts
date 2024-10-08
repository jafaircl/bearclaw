/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { isNil } from '@bearclaw/is';
import {
  Type,
  TypeSchema,
  Type_AbstractTypeSchema,
  Type_FunctionTypeSchema,
  Type_ListTypeSchema,
  Type_MapTypeSchema,
  Type_PrimitiveType,
  Type_PrimitiveTypeSchema,
  Type_WellKnownType,
  Type_WellKnownTypeSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb.js';
import { MessageInitShape, create, enumToJson } from '@bufbuild/protobuf';
import { EmptySchema, NullValue } from '@bufbuild/protobuf/wkt';

export interface Location {
  line: number;
  column: number;
}

export interface OffsetRange {
  start: number;
  stop: number;
}

export const DYN_TYPE = create(TypeSchema, {
  typeKind: {
    case: 'dyn',
    value: create(EmptySchema),
  },
});

export const NULL_TYPE = create(TypeSchema, {
  typeKind: {
    case: 'null',
    value: NullValue.NULL_VALUE,
  },
});

export function primitiveType(value: Type_PrimitiveType) {
  return create(TypeSchema, {
    typeKind: {
      case: 'primitive',
      value,
    },
  });
}

export const BOOL_TYPE = primitiveType(Type_PrimitiveType.BOOL);
export const BYTES_TYPE = primitiveType(Type_PrimitiveType.BYTES);
export const DOUBLE_TYPE = primitiveType(Type_PrimitiveType.DOUBLE);
export const INT64_TYPE = primitiveType(Type_PrimitiveType.INT64);
export const STRING_TYPE = primitiveType(Type_PrimitiveType.STRING);
export const UINT64_TYPE = primitiveType(Type_PrimitiveType.UINT64);

export function wrapperType(value: Type_PrimitiveType) {
  return create(TypeSchema, {
    typeKind: {
      case: 'wrapper',
      value,
    },
  });
}

export function wellKnownType(value: Type_WellKnownType) {
  return create(TypeSchema, {
    typeKind: {
      case: 'wellKnown',
      value,
    },
  });
}

export const ANY_TYPE = wellKnownType(Type_WellKnownType.ANY);
export const DURATION_TYPE = wellKnownType(Type_WellKnownType.DURATION);
export const TIMESTAMP_TYPE = wellKnownType(Type_WellKnownType.TIMESTAMP);

export function listType(value: MessageInitShape<typeof Type_ListTypeSchema>) {
  return create(TypeSchema, {
    typeKind: {
      case: 'listType',
      value,
    },
  });
}

export function mapType(value: MessageInitShape<typeof Type_MapTypeSchema>) {
  return create(TypeSchema, {
    typeKind: {
      case: 'mapType',
      value,
    },
  });
}

export function functionType(
  value: MessageInitShape<typeof Type_FunctionTypeSchema>
) {
  return create(TypeSchema, {
    typeKind: {
      case: 'function',
      value,
    },
  });
}

export function unwrapFunctionType(val: Type) {
  if (val.typeKind.case === 'function') {
    return val.typeKind.value;
  }
  return null;
}

export function messageType(value: string) {
  return create(TypeSchema, {
    typeKind: {
      case: 'messageType',
      value,
    },
  });
}

export function unwrapMessageType(val: Type) {
  if (val.typeKind.case === 'messageType') {
    return val.typeKind.value;
  }
  return null;
}

export function typeParamType(value: string) {
  return create(TypeSchema, {
    typeKind: {
      case: 'typeParam',
      value,
    },
  });
}

export function typeType(value: Type) {
  return create(TypeSchema, {
    typeKind: {
      case: 'type',
      value,
    },
  });
}

export const ERROR_TYPE = create(TypeSchema, {
  typeKind: {
    case: 'error',
    value: create(EmptySchema),
  },
});

export function abstractType(
  value: MessageInitShape<typeof Type_AbstractTypeSchema>
) {
  return create(TypeSchema, {
    typeKind: {
      case: 'abstractType',
      value,
    },
  });
}

export function optionalType(value: Type) {
  return abstractType({ name: 'optional_type', parameterTypes: [value] });
}

export function isOptionalType(val: Type) {
  return (
    val.typeKind.case === 'abstractType' &&
    val.typeKind.value.name === 'optional_type'
  );
}

export function unwrapOptionalType(val: Type) {
  if (isOptionalType(val)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (val.typeKind.value as any).parameterTypes[0] as Type;
  }
  return null;
}

export function maybeUnwrapOptionalType(val: Type | null | undefined) {
  if (isNil(val)) {
    return null;
  }
  return unwrapOptionalType(val);
}

export function wrappedType(value: Type_PrimitiveType) {
  return create(TypeSchema, {
    typeKind: {
      case: 'wrapper',
      value,
    },
  });
}

export function nullableType(value: Type) {
  return abstractType({ name: 'nullable_type', parameterTypes: [value] });
}

export function isNullableType(val: Type) {
  return (
    val.typeKind.case === 'abstractType' &&
    val.typeKind.value.name === 'nullable_type'
  );
}

export function unwrapNullableType(val: Type) {
  if (isNullableType(val)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (val.typeKind.value as any).parameterTypes[0] as Type;
  }
  return null;
}

export function isDyn(val: Type) {
  return val.typeKind.case === 'dyn';
}

export function isError(val: Type) {
  return val.typeKind.case === 'error';
}

export function isDynOrError(val: Type) {
  return isDyn(val) || isError(val);
}

export function isNullType(val: Type) {
  return val.typeKind.case === 'null';
}

/**
 * Checks whether one type is equal or less specific than another. A type is
 * less specific if it matches the other type using the DYN type
 * @param t1 the first type
 * @param t2 the second type
 */
export function isEqualOrLessSpecific(t1: Type, t2: Type): boolean {
  const kind1 = t1.typeKind.case;
  const kind2 = t2.typeKind.case;
  // The first type is less specific
  if (isDyn(t1) || kind1 === 'typeParam') {
    return true;
  }
  // The first type is not less specific.
  if (isDyn(t2) || kind2 === 'typeParam') {
    return false;
  }
  // Types must be of the same kind to be equal.
  if (kind1 !== kind2) {
    return false;
  }
  // With limited exceptions for ANY and JSON values, the types must agree and
  // be equivalent in order to return true.
  switch (kind1) {
    case 'abstractType':
      if (t1.typeKind.case !== t2.typeKind.case) {
        // We will never get here
        throw new Error('kinds must be equal');
      }
      if (
        t1.$typeName !== t2.$typeName ||
        t1.typeKind.value.parameterTypes.length !==
          t2.typeKind.value.parameterTypes.length
      ) {
        return false;
      }
      for (let i = 0; i < t1.typeKind.value.parameterTypes.length; i++) {
        if (
          isEqualOrLessSpecific(
            t1.typeKind.value.parameterTypes[i],
            t2.typeKind.value.parameterTypes[i]
          )
        ) {
          return false;
        }
      }
      return true;
    case 'listType':
      if (t1.typeKind.case !== t2.typeKind.case) {
        // We will never get here
        throw new Error('kinds must be equal');
      }
      return isEqualOrLessSpecific(
        t1.typeKind.value.elemType!,
        t2.typeKind.value.elemType!
      );
    case 'mapType':
      if (t1.typeKind.case !== t2.typeKind.case) {
        // We will never get here
        throw new Error('kinds must be equal');
      }
      return (
        isEqualOrLessSpecific(
          t1.typeKind.value.keyType!,
          t2.typeKind.value.keyType!
        ) &&
        isEqualOrLessSpecific(
          t1.typeKind.value.valueType!,
          t2.typeKind.value.valueType!
        )
      );
    case 'type':
      if (t1.typeKind.case !== t2.typeKind.case) {
        // We will never get here
        throw new Error('kinds must be equal');
      }
      return true;
    default:
      return (
        t1.typeKind.case === t2.typeKind.case &&
        t1.typeKind.value === t2.typeKind.value
      );
  }
}

/**
 * Returns the more general of two types which are known to unify.
 *
 * @param t1 the first type
 * @param t2 the second type
 * @returns the most general type that is equal or less specific than both
 * input types
 */
export function mostGeneral(t1: Type, t2: Type): Type {
  if (isEqualOrLessSpecific(t1, t2)) {
    return t1;
  }
  return t2;
}

/**
 * Returns an updated type substitution mapping if t1 is assignable to t2.
 * @param mapping the current type substitution mapping
 * @param t1 the first type
 * @param t2 the second type
 * @returns an updated type substitution mapping or null if t1 is not assignable
 */
export function isAssignable(mapping: Map<string, Type>, t1: Type, t2: Type) {
  const copy = new Map(mapping);
  if (internalIsAssignable(copy, t1, t2)) {
    return copy;
  }
  return null;
}

/**
 * Returns an updated substitution mapping if l1 is assignable to l2.
 *
 * @param mapping the current type substitution mapping
 * @param l1 the first list
 * @param l2 the second list
 * @returns an updated type substitution mapping or null if l1 is not assignable
 */
export function isAssignableList(
  mapping: Map<string, Type>,
  l1: Type[],
  l2: Type[]
) {
  const copy = new Map(mapping);
  for (let i = 0; i < l1.length; i++) {
    if (!internalIsAssignable(copy, l1[i], l2[i])) {
      return null;
    }
  }
  return copy;
}

/**
 * Returns true if t1 is assignable to t2.
 *
 * @param mapping the current type substitution mapping
 * @param t1 the first type
 * @param t2 the second type
 * @returns whether t1 is assignable to t2
 */
export function internalIsAssignable(
  mapping: Map<string, Type>,
  t1: Type,
  t2: Type
): boolean {
  // Process type parameters
  const kind1 = t1.typeKind.case;
  const kind2 = t2.typeKind.case;
  if (kind2 === 'typeParam') {
    // If t2 is a valid type substitution for t1, return true.
    const [valid, t2HasSub] = isValidTypeSubstitution(mapping, t1, t2);
    if (valid) {
      return true;
    }
    // If t2 is not a valid type sub for t1, and already has a known
    // substitution return false since it is not possible for t1 to be
    // substitution for t2.
    if (!valid && t2HasSub) {
      return false;
    }
    // Otherwise, fall through to check whether t1 is a possible substitution
    // for t2.
  }
  if (kind1 === 'typeParam') {
    // Return whether t1 is a valid substitution for t2. If not, do no
    // additional checks as the possible type substitutions have been searched
    // in both directions.
    const [valid, _] = isValidTypeSubstitution(mapping, t2, t1);
    return valid;
  }
  // Next check for wildcard types.
  if (isDynOrError(t1) || isDynOrError(t2)) {
    return true;
  }
  // Preserve the nullness checks of the legacy type-checker.
  if (kind1 == 'null') {
    return internalIsAssignableNull(t2);
  }
  if (kind2 == 'null') {
    return internalIsAssignableNull(t1);
  }
  // Test for when the types do not need to agree, but are more specific than
  // dyn.
  switch (kind1) {
    case 'primitive':
    case 'wellKnown':
    case 'messageType':
    case 'wrapper':
    case 'error':
      return isAssignableType(t1, t2);
    case 'type':
      return kind2 === 'type';
    case 'abstractType':
      return (
        t2.typeKind.case === 'abstractType' &&
        internalIsAssignableList(
          mapping,
          t1.typeKind.value.parameterTypes,
          t2.typeKind.value.parameterTypes
        )
      );
    case 'listType':
      return (
        t2.typeKind.case === 'listType' &&
        internalIsAssignable(
          mapping,
          t1.typeKind.value.elemType!,
          t2.typeKind.value.elemType!
        )
      );
    case 'mapType':
      return (
        t2.typeKind.case === 'mapType' &&
        internalIsAssignable(
          mapping,
          t1.typeKind.value.keyType!,
          t2.typeKind.value.keyType!
        ) &&
        internalIsAssignable(
          mapping,
          t1.typeKind.value.valueType!,
          t2.typeKind.value.valueType!
        )
      );
    default:
      return false;
  }
}

/**
 * Returns true if the element types at each index in the list are
 * assignable from l1[i] to l2[i]. The list lengths must also agree for the
 * lists to be assignable.
 * @param mapping the type map to use for checking references
 * @param l1 the first list type
 * @param l2 the second list type
 * @returns whether the list types are assignable
 */
export function internalIsAssignableList(
  mapping: Map<string, Type>,
  l1: Type[],
  l2: Type[]
) {
  if (l1.length !== l2.length) {
    return false;
  }
  for (let i = 0; i < l1.length; i++) {
    if (!internalIsAssignable(mapping, l1[i], l2[i])) {
      return false;
    }
  }
  return true;
}

/**
 * Returns true if the type is nullable.
 * @param t the type to check
 * @returns whether the type is nullable
 */
export function internalIsAssignableNull(t: Type) {
  return isAssignableType(t, NULL_TYPE);
}

/**
 * Returns whether t2 (or its type substitution) is a valid type substitution
 * for t1, and whether t2 has a type substitution in mapping m.
 * The type t2 is a valid substitution for t1 if any of the following
 * statements is true
 * - t2 has a type substitution (t2sub) equal to t1
 * - t2 has a type substitution (t2sub) assignable to t1
 * - t2 does not occur within t1.
 *
 * @param mapping the type map to use for checking references
 * @param t1 the first type
 * @param t2 the second type
 * @returns a tuple where the first element is whether t2 is a valid type
 * substitution for t1, and the second element is whether t2 has a type
 * substitution in the mapping
 */
export function isValidTypeSubstitution(
  mapping: Map<string, Type>,
  t1: Type,
  t2: Type
): [boolean, boolean] {
  // Early return if the t1 and t2 are the same instance.
  const kind1 = t1.typeKind.case;
  const kind2 = t2.typeKind.case;
  if (kind1 === kind2 && t1 === t2) {
    return [true, true];
  }
  const t2sub = Array.from(mapping).find(([_, v]) => v === t2)?.[1];
  if (!isNil(t2sub)) {
    // Early return if t1 and t2Sub are the same instance as otherwise the
    // mapping might mark a type as being a subtitution for itself.
    if (kind1 === t2sub.typeKind.case && t1 === t2sub) {
      return [true, true];
    }
    // If the types are compatible, pick the more general type and return true
    if (internalIsAssignable(mapping, t1, t2sub)) {
      const t2New = mostGeneral(t1, t2sub);
      // only update the type reference map if the target type does not occur
      // within it.
      if (notReferencedIn(mapping, t2New, t2)) {
        mapping.set(formatCELType(t2New), t2New);
      }
      // acknowledge the type agreement, and that the substitution is already
      // tracked.
      return [true, true];
    }
    return [false, true];
  }
  if (notReferencedIn(mapping, t2, t1)) {
    mapping.set(formatCELType(t2), t1);
    return [true, false];
  }
  return [false, false];
}

/**
 * Checks whether the type doesn't appear directly or transitively within the
 * other type. This is a standard requirement for type unification, commonly
 * referred to as the "occurs check".
 * @param m the type map to use for checking references
 * @param t the type to use for checking references
 * @param withinType the type to check for references
 * @returns whether the type is not referenced in the other type
 */
export function notReferencedIn(
  m: Map<string, Type>,
  t: Type,
  withinType: Type
): boolean {
  if (t === withinType) {
    return false;
  }
  const withinKind = withinType.typeKind.case;
  switch (withinKind) {
    case 'typeParam':
      const wtSub = Array.from(m).find(([_, v]) => v === withinType)?.[1];
      if (isNil(wtSub)) {
        return true;
      }
      return notReferencedIn(m, t, wtSub);
    case 'abstractType':
      for (const pt of withinType.typeKind.value.parameterTypes) {
        if (!notReferencedIn(m, t, pt)) {
          return false;
        }
      }
      return true;
    case 'listType':
      return notReferencedIn(m, t, withinType.typeKind.value.elemType!);
    case 'mapType':
      return (
        notReferencedIn(m, t, withinType.typeKind.value.keyType!) &&
        notReferencedIn(m, t, withinType.typeKind.value.valueType!)
      );
    case 'type':
      return t.typeKind.value !== withinType;
    default:
      return true;
  }
}

/**
 * Determines whether the current type is type-check assignable from the input
 * fromType.
 * @param current the current type
 * @param fromType the type to check against
 * @returns whether the current type is assignable from the input fromType
 */
export function isAssignableType(current: Type, fromType: Type) {
  if (isNil(current)) {
    return false;
  }
  return defaultIsAssignableType(current, fromType);
}

/**
 * Provides the standard definition of what it means for one type to be
 * assignable to another where any of the following may return a true result:
 * - The from types are the same instance
 * - The target type is dynamic
 * - The fromType has the same kind and type name as the target type, and all
 * parameters of the target type are IsAssignableType() from the parameters of
 * the fromType.
 *
 * @param current the current type
 * @param fromType the type to check against
 */
export function defaultIsAssignableType(
  current: Type,
  fromType: Type
): boolean {
  if (current === fromType || isDyn(current)) {
    return true;
  }
  if (isNullableType(current) && isNullType(fromType)) {
    return true;
  }
  if (current.typeKind.case === 'typeParam') {
    return true;
  }
  const unwrappedCurrent = unwrapNullableType(current);
  if (
    !isNil(unwrappedCurrent) &&
    isNullableType(current) &&
    defaultIsAssignableType(unwrappedCurrent, fromType)
  ) {
    return true;
  }
  if (
    current.typeKind.case !== fromType.typeKind.case ||
    current.$typeName !== fromType.$typeName
  ) {
    return false;
  }
  switch (current.typeKind.case) {
    case 'abstractType':
      if (fromType.typeKind.case !== current.typeKind.case) {
        return false;
      }
      for (let i = 0; i < current.typeKind.value.parameterTypes.length; i++) {
        if (
          !defaultIsAssignableType(
            current.typeKind.value.parameterTypes[i],
            fromType.typeKind.value.parameterTypes[i]
          )
        ) {
          return false;
        }
      }
      return true;
    case 'listType':
      if (fromType.typeKind.case !== current.typeKind.case) {
        return false;
      }
      return defaultIsAssignableType(
        current.typeKind.value.elemType!,
        fromType.typeKind.value.elemType!
      );
    case 'mapType':
      if (fromType.typeKind.case !== current.typeKind.case) {
        return false;
      }
      return (
        defaultIsAssignableType(
          current.typeKind.value.keyType!,
          fromType.typeKind.value.keyType!
        ) &&
        defaultIsAssignableType(
          current.typeKind.value.valueType!,
          fromType.typeKind.value.valueType!
        )
      );
    default:
      break;
  }
  return isExactType(current, fromType);
}

/**
 * Replaces all direct and indirect occurrences of bound type parameters.
 * Unbound type parameters are replaced by DYN if typeParamToDyn is true.
 */
export function substitute(
  mapping: Map<string, Type>,
  t: Type,
  typeParamToDyn: boolean
): Type {
  const tSub = findTypeInMapping(mapping, t);
  if (!isNil(tSub)) {
    return substitute(mapping, tSub, typeParamToDyn);
  }
  if (typeParamToDyn && t.typeKind.case === 'typeParam') {
    return DYN_TYPE;
  }
  switch (t.typeKind.case) {
    case 'abstractType':
      return abstractType({
        name: t.typeKind.value.name,
        parameterTypes: t.typeKind.value.parameterTypes.map((_t) =>
          substitute(mapping, _t, typeParamToDyn)
        ),
      });
    case 'listType':
      return listType({
        elemType: substitute(
          mapping,
          t.typeKind.value.elemType!,
          typeParamToDyn
        ),
      });
    case 'mapType':
      return mapType({
        keyType: substitute(mapping, t.typeKind.value.keyType!, typeParamToDyn),
        valueType: substitute(
          mapping,
          t.typeKind.value.valueType!,
          typeParamToDyn
        ),
      });
    case 'type':
      return substitute(mapping, t.typeKind.value, typeParamToDyn);
    case 'typeParam':
      const sub = mapping.get(t.typeKind.value);
      if (!isNil(sub)) {
        return substitute(mapping, sub, typeParamToDyn);
      }
      return t;
    case 'messageType':
      // Handle special cases for certain message types.
      switch (t.typeKind.value) {
        case 'google.protobuf.Struct':
          return mapType({
            keyType: STRING_TYPE,
            valueType: DYN_TYPE,
          });
        case 'google.protobuf.Value':
          return DYN_TYPE;
        case 'google.protobuf.ListValue':
          return listType({ elemType: DYN_TYPE });
        default:
          break;
      }
      return t;
    default:
      return t;
  }
}

export function formatCELType(t: Type | null): string {
  switch (t?.typeKind.case) {
    case 'primitive':
      switch (t.typeKind.value) {
        case Type_PrimitiveType.BOOL:
          return 'bool';
        case Type_PrimitiveType.BYTES:
          return 'bytes';
        case Type_PrimitiveType.DOUBLE:
          return 'double';
        case Type_PrimitiveType.INT64:
          return 'int';
        case Type_PrimitiveType.STRING:
          return 'string';
        case Type_PrimitiveType.UINT64:
          return 'uint';
        default:
          return enumToJson(
            Type_PrimitiveTypeSchema,
            t.typeKind.value
          ) as string;
      }
    case 'wellKnown':
      switch (t.typeKind.value) {
        case Type_WellKnownType.ANY:
          return 'any';
        case Type_WellKnownType.DURATION:
          return 'duration';
        case Type_WellKnownType.TIMESTAMP:
          return 'timestamp';
        default:
          return enumToJson(
            Type_WellKnownTypeSchema,
            t.typeKind.value
          ) as string;
      }
    case 'error':
      return '!error!';
    case 'null':
      return 'null';
    case 'typeParam':
      return t.typeKind.value;
    case 'abstractType':
      if (t.typeKind.value.name === 'function') {
        // TODO: implement
      }
      break;
    case 'listType':
      return `list(${formatCELType(t.typeKind.value.elemType!)})`;
    case 'type':
      return formatCELType(t.typeKind.value);
    case 'messageType':
      return t.typeKind.value;
    case 'mapType':
      const keyType = formatCELType(t.typeKind.value.keyType!);
      const valueType = formatCELType(t.typeKind.value.valueType!);
      return `map(${keyType}, ${valueType})`;
  }
  return '';
}

export function findTypeInMapping(mapping: Map<string, Type>, t: Type) {
  return mapping.get(formatCELType(t));
}

export function findTypeKeyInMapping(mapping: Map<string, Type>, t: Type) {
  return Array.from(mapping).find(([_, v]) => v === t)?.[0];
}

/**
 * Indicates whether the two types are exactly the same.
 *
 * @param t1 the first type
 * @param t2 the second type
 * @returns a boolean indicating whether the types are exactly the same
 */
export function isExactType(t1: Type, t2: Type): boolean {
  if (isNil(t1)) {
    return false;
  }
  if (t1 === t2) {
    return true;
  }
  if (t1.typeKind.case !== t2.typeKind.case) {
    return false;
  }
  switch (t1.typeKind.case) {
    case 'primitive':
    case 'wellKnown':
    case 'messageType':
    case 'wrapper':
    case 'typeParam':
    case 'dyn':
    case 'error':
    case 'null':
      return t1.typeKind.value === t2.typeKind.value;
    case 'abstractType':
      if (t2.typeKind.case !== t1.typeKind.case) {
        return false;
      }
      return (
        t1.typeKind.value.name === t2.typeKind.value.name &&
        isExactTypeList(
          t1.typeKind.value.parameterTypes,
          t2.typeKind.value.parameterTypes
        )
      );
    case 'function':
      if (t2.typeKind.case !== t1.typeKind.case) {
        return false;
      }
      return (
        isExactTypeList(
          t1.typeKind.value.argTypes,
          t2.typeKind.value.argTypes
        ) &&
        isExactType(
          t1.typeKind.value.resultType!,
          t2.typeKind.value.resultType!
        )
      );
    case 'listType':
      if (t2.typeKind.case !== t1.typeKind.case) {
        return false;
      }
      return isExactType(
        t1.typeKind.value.elemType!,
        t2.typeKind.value.elemType!
      );
    case 'mapType':
      if (t2.typeKind.case !== t1.typeKind.case) {
        return false;
      }
      return (
        isExactType(t1.typeKind.value.keyType!, t2.typeKind.value.keyType!) &&
        isExactType(t1.typeKind.value.valueType!, t2.typeKind.value.valueType!)
      );
    case 'type':
      if (t2.typeKind.case !== t1.typeKind.case) {
        return false;
      }
      return isExactType(t1.typeKind.value, t2.typeKind.value);
    default:
      return true;
  }
}

/**
 * Indicates whether the two type lists are exactly the same.
 *
 * @param t1 the first type list
 * @param t2 the second type list
 * @returns whether the two type lists are exactly the same
 */
export function isExactTypeList(t1: Type[], t2: Type[]) {
  if (t1.length !== t2.length) {
    return false;
  }
  for (let i = 0; i < t1.length; i++) {
    if (!isExactType(t1[i], t2[i])) {
      return false;
    }
  }
  return true;
}

export function formatFunctionDeclType(
  resultType: Type | null,
  argTypes: Type[],
  isInstance: boolean
): string {
  return formatFunctionInternal(
    resultType,
    argTypes,
    isInstance,
    formatCELType
  );
}

function formatFunctionInternal<T>(
  resultType: T | null,
  argTypes: T[],
  isInstance: boolean,
  format: (value: T | null) => string
): string {
  let result = '';
  if (isInstance) {
    const target = argTypes[0];
    argTypes = argTypes.slice(1);
    result += format(target);
    result += '.';
  }
  result += '(';
  for (let i = 0; i < argTypes.length; i++) {
    if (i > 0) {
      result += ', ';
    }
    result += format(argTypes[i]);
  }
  result += ')';
  const rt = format(resultType);
  if (rt !== '') {
    result += ' -> ';
    result += rt;
  }
  return result;
}
