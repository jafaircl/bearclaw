/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { isNil } from '@bearclaw/is';
import {
  Type,
  Type_AbstractType,
  Type_FunctionType,
  Type_ListType,
  Type_MapType,
  Type_PrimitiveType,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb.js';
import { formatCELType } from '../common/format';
import { abstractType } from '../common/types/abstract';
import { DYN_CEL_TYPE, isDynType } from '../common/types/dyn';
import { functionType } from '../common/types/function';
import { listType } from '../common/types/list';
import { mapType } from '../common/types/map';
import { isNullType } from '../common/types/null';
import { isNullableType, unwrapNullableType } from '../common/types/nullable';
import { primitiveType } from '../common/types/primitive';
import { typeType } from '../common/types/type';
import { isDynTypeOrErrorType } from '../common/types/utils';
import { getCheckedWellKnownType } from '../common/types/wkt';
import { wrapperType } from '../common/types/wrapper';

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
  if (isDynType(t1) || kind1 === 'typeParam') {
    return true;
  }
  // The first type is not less specific.
  if (isDynType(t2) || kind2 === 'typeParam') {
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
        t1.typeKind.value.name !== t2.typeKind.value.name ||
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
    case 'function':
      if (t1.typeKind.case !== t2.typeKind.case) {
        // We will never get here
        throw new Error('kinds must be equal');
      }
      if (
        !isEqualOrLessSpecific(
          t1.typeKind.value.resultType!,
          t2.typeKind.value.resultType!
        )
      ) {
        return false;
      }
      if (
        t1.typeKind.value.argTypes.length !== t2.typeKind.value.argTypes.length
      ) {
        return false;
      }
      for (let i = 0; i < t1.typeKind.value.argTypes.length; i++) {
        if (
          isEqualOrLessSpecific(
            t1.typeKind.value.argTypes[i],
            t2.typeKind.value.argTypes[i]
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
  if (internalIsAssignableList(copy, l1, l2)) {
    return copy;
  }
  return null;
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
  // A type is always assignable to itself.
  // Early terminate the call to avoid cases of infinite recursion.
  if (t1 === t2) {
    return true;
  }
  // Process type parameters
  const kind1 = t1.typeKind.case;
  const kind2 = t2.typeKind.case;
  if (kind2 === 'typeParam') {
    const t2Sub = mapping.get(formatCELType(t2));
    if (!isNil(t2Sub)) {
      // If the types are compatible, pick the more general type and return true
      if (internalIsAssignable(mapping, t1, t2Sub)) {
        mapping.set(formatCELType(t2), mostGeneral(t1, t2Sub));
        return true;
      }
      return false;
    }
    if (notReferencedIn(mapping, t2, t1)) {
      mapping.set(formatCELType(t2), t1);
      return true;
    }
  }
  if (kind1 === 'typeParam') {
    // For the lower type bound, we currently do not perform adjustment. The restricted
    // way we use type parameters in lower type bounds, it is not necessary, but may
    // become if we generalize type unification.
    const t1Sub = mapping.get(formatCELType(t1));
    if (!isNil(t1Sub)) {
      // If the types are compatible, pick the more general type and return true
      if (internalIsAssignable(mapping, t1Sub, t2)) {
        mapping.set(formatCELType(t1), mostGeneral(t1Sub, t2));
        return true;
      }
      return false;
    }
    if (notReferencedIn(mapping, t1, t2)) {
      mapping.set(formatCELType(t1), t2);
      return true;
    }
  }
  // Next check for wildcard types.
  if (isDynTypeOrErrorType(t1) || isDynTypeOrErrorType(t2)) {
    return true;
  }

  // Test for when the types do not need to agree, but are more specific than dyn.
  switch (kind1) {
    case 'null':
      return internalIsAssignableNull(t2);
    case 'primitive':
      return internalIsAssignablePrimitive(t1.typeKind.value, t2);
    case 'wrapper':
      return internalIsAssignable(
        mapping,
        primitiveType(t1.typeKind.value),
        t2
      );
    default:
      if (kind1 != kind2) {
        return false;
      }
  }

  // Test for when the types must agree.
  switch (kind1) {
    // ERROR, TYPE_PARAM, and DYN handled above.
    case 'abstractType':
      return internalIsAssignableAbstractType(
        mapping,
        t1.typeKind.value,
        t2.typeKind.value as Type_AbstractType
      );
    case 'function':
      return internalIsAssignableFunction(
        mapping,
        t1.typeKind.value,
        t2.typeKind.value as Type_FunctionType
      );
    case 'listType':
      return internalIsAssignable(
        mapping,
        t1.typeKind.value.elemType!,
        (t2.typeKind.value as Type_ListType).elemType!
      );
    case 'mapType':
      return internalIsAssignableMap(
        mapping,
        t1.typeKind.value,
        t2.typeKind.value as Type_MapType
      );
    case 'messageType':
      return t1.typeKind.value === t2.typeKind.value;
    case 'type':
      // A type is a type is a type, any additional parameterization of the
      // type cannot affect method resolution or assignability.
      return true;
    case 'wellKnown':
      return t1.typeKind.value === t2.typeKind.value;
    default:
      return false;
  }
}

/**
 * Returns true if the target type is the same or if it is a wrapper
 * for the primitive type.
 *
 * @param p1 the primitive type
 * @param t2 the target type
 * @returns whether the primitive type is assignable to the target type
 */
export function internalIsAssignablePrimitive(
  p1: Type_PrimitiveType,
  t2: Type
): boolean {
  switch (t2.typeKind.case) {
    case 'primitive':
      return p1 === t2.typeKind.value;
    case 'wrapper':
      return p1 === t2.typeKind.value;
    default:
      return false;
  }
}

/**
 * Returns true if the abstract type names agree and all type
 * parameters are assignable.
 *
 * @param mapping the type map to use for checking references
 * @param a1 the first abstract type
 * @param a2 the second abstract type
 * @returns whether the abstract types are assignable
 */
export function internalIsAssignableAbstractType(
  mapping: Map<string, Type>,
  a1: Type_AbstractType,
  a2: Type_AbstractType
): boolean {
  if (a1.name !== a2.name) {
    return false;
  }
  return internalIsAssignableList(
    mapping,
    a1.parameterTypes,
    a2.parameterTypes
  );
}

/**
 * Returns true if the function return type and arg types are
 * assignable.
 */
export function internalIsAssignableFunction(
  mapping: Map<string, Type>,
  f1: Type_FunctionType,
  f2: Type_FunctionType
) {
  const f1Args = flattenFunctionTypes(f1);
  const f2Args = flattenFunctionTypes(f2);
  return internalIsAssignableList(mapping, f1Args, f2Args);
}

/**
 * Takes a function with arg types T1, T2, ..., TN and result type TR and
 * returns a slice containing {T1, T2, ..., TN, TR}.
 *
 * @param f the function type
 * @returns the list of types for the function
 */
export function flattenFunctionTypes(f: Type_FunctionType) {
  const argTypes = f.argTypes;
  if (argTypes.length === 0) {
    return [f.resultType!];
  }
  for (let i = 0; i < argTypes.length; i++) {
    argTypes.push(argTypes[i]);
  }
  argTypes.push(f.resultType!);
  return argTypes;
}

/**
 * Returns true if map m1 may be assigned to map m2.
 *
 * @param mapping the type map to use for checking references
 * @param m1 the first map type
 * @param m2 the second map type
 * @returns whether the map types are assignable
 */
export function internalIsAssignableMap(
  mapping: Map<string, Type>,
  m1: Type_MapType,
  m2: Type_MapType
) {
  return internalIsAssignableList(
    mapping,
    [m1.keyType!, m1.valueType!],
    [m2.keyType!, m2.valueType!]
  );
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
  switch (t.typeKind.case) {
    case 'abstractType':
    case 'messageType':
    case 'null':
    case 'wellKnown':
    case 'wrapper':
      return true;
    default:
      return false;
  }
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
  if (isExactType(t, withinType)) {
    return false;
  }
  switch (withinType.typeKind.case) {
    case 'typeParam':
      const wtSub = m.get(formatCELType(withinType));
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
    case 'function':
      if (!notReferencedIn(m, t, withinType.typeKind.value.resultType!)) {
        return false;
      }
      for (const pt of withinType.typeKind.value.argTypes) {
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
    case 'wrapper':
      return notReferencedIn(m, t, wrapperType(withinType.typeKind.value));
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
  if (current === fromType || isDynType(current)) {
    return true;
  }
  if (isNullableType(current) && isNullType(fromType)) {
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
  switch (current.typeKind.case) {
    case 'primitive':
    case 'wellKnown':
    case 'wrapper':
      return current.typeKind.value === fromType.typeKind.value;
    case 'messageType':
      const checkedType = getCheckedWellKnownType(current.typeKind.value);
      if (!isNil(checkedType)) {
        return defaultIsAssignableType(checkedType, fromType);
      }
      return current.typeKind.value === fromType.typeKind.value;
    case 'type':
      return fromType.typeKind.case === 'type';
    case 'abstractType':
      if (current.typeKind.case !== fromType.typeKind.case) {
        return false;
      }
      if (
        current.typeKind.value.parameterTypes.length !==
        fromType.typeKind.value.parameterTypes.length
      ) {
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
      if (fromType.typeKind.case !== 'listType') {
        return false;
      }
      return defaultIsAssignableType(
        current.typeKind.value.elemType!,
        fromType.typeKind.value.elemType!
      );
    case 'mapType':
      if (fromType.typeKind.case !== 'mapType') {
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
      return true;
  }
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
  const tSub = mapping.get(formatCELType(t));
  if (!isNil(tSub)) {
    return substitute(mapping, tSub, typeParamToDyn);
  }
  if (typeParamToDyn && t.typeKind.case === 'typeParam') {
    return DYN_CEL_TYPE;
  }
  switch (t.typeKind.case) {
    case 'function':
      return functionType({
        argTypes: t.typeKind.value.argTypes.map((_t) =>
          substitute(mapping, _t, typeParamToDyn)
        ),
        resultType: substitute(
          mapping,
          t.typeKind.value.resultType!,
          typeParamToDyn
        ),
      });
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
      return typeType(substitute(mapping, t.typeKind.value, typeParamToDyn));
    default:
      return t;
  }
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

export function formatFunctionType(
  resultType: Type | null,
  argTypes: Type[],
  isInstance: boolean
): string {
  let result = '';
  if (isInstance) {
    const target = argTypes[0];
    argTypes = argTypes.slice(1);
    result = formatCELType(target) + '.';
  }
  result += '(';
  for (let i = 0; i < argTypes.length; i++) {
    const argType = argTypes[i];
    if (i > 0) {
      result += ', ';
    }
    result += formatCELType(argType);
  }
  result += ')';
  if (!isNil(resultType)) {
    result += ' -> ' + formatCELType(resultType);
  }
  return result;
}
