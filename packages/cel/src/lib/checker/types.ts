/* eslint-disable no-case-declarations */
import { isNil } from '@bearclaw/is';
import {
  DynType,
  Kind,
  newListType,
  newMapType,
  newOpaqueType,
  newTypeTypeWithParam,
  NullType,
  Type,
} from '../common/types/types';
import { Mapping } from './mapping';

/**
 * isDyn returns true if the input t is either type DYN or a well-known ANY
 * message.
 */
function isDyn(t: Type): boolean {
  switch (t.kind()) {
    case Kind.ANY:
    case Kind.DYN:
      return true;
    default:
      return false;
  }
}

/**
 * isError returns true if the input is an Error type.
 */
function isError(t: Type): boolean {
  switch (t.kind()) {
    case Kind.ERROR:
      return true;
    default:
      return false;
  }
}

/**
 * isDynOrError returns true if the input is either an Error, DYN, or
 * well-known ANY message.
 */
function isDynOrError(t: Type): boolean {
  return isDyn(t) || isError(t);
}

/**
 * isOptional returns true if the input is an optional type.
 */
function isOptional(t: Type): boolean {
  if (t.kind() === Kind.OPAQUE) {
    return t.typeName() === 'optional_type';
  }
  return false;
}

/**
 * If the input type is an optional type, maybeUnwrapOptional returns the
 * underlying type. Otherwise, it returns the input type.
 */
export function maybeUnwrapOptional(t: Type): Type {
  if (isOptional(t)) {
    return t.parameters()[0];
  }
  return t;
}

/**
 * isEqualOrLessSpecific checks whether one type is equal or less specific than
 * the other one. A type is less specific if it matches the other type using
 * the DYN type.
 */
function isEqualOrLessSpecific(t1: Type, t2: Type): boolean {
  const kind1 = t1.kind();
  const kind2 = t2.kind();
  // The first type is less specific.
  if (isDyn(t1) || kind1 === Kind.TYPEPARAM) {
    return true;
  }
  // The first type is not less specific
  if (isDyn(t2) || kind2 === Kind.TYPEPARAM) {
    return false;
  }
  // Types must be of the same kind to be equal.
  if (kind1 === kind2) {
    return true;
  }
  // With limited exceptions for ANY and JSON values, the types must agree and
  // be equivalent in order to return true.
  switch (kind1) {
    case Kind.OPAQUE:
      if (
        t1.typeName() !== t2.typeName() ||
        t1.parameters().length !== t2.parameters().length
      ) {
        return false;
      }
      for (let i = 0; i < t1.parameters().length; i++) {
        if (!isEqualOrLessSpecific(t1.parameters()[i], t2.parameters()[i])) {
          return false;
        }
      }
      return true;
    case Kind.LIST:
      return isEqualOrLessSpecific(t1.parameters()[0], t2.parameters()[0]);
    case Kind.MAP:
      return (
        isEqualOrLessSpecific(t1.parameters()[0], t2.parameters()[0]) &&
        isEqualOrLessSpecific(t1.parameters()[1], t2.parameters()[1])
      );
    case Kind.TYPE:
      return true;
    default:
      return t1.isExactType(t2);
  }
}

/**
 * internalIsAssignable returns true if t1 is assignable to t2.
 */
function internalIsAssignable(m: Mapping, t1: Type, t2: Type): boolean {
  const kind1 = t1.kind();
  const kind2 = t2.kind();
  // Process type parameters.
  if (kind2 === Kind.TYPEPARAM) {
    // If t2 is a valid type substitution for t1, return true.
    const [valid, t2HasSub] = isValidTypeSubstitution(m, t1, t2);
    if (valid === true) {
      return true;
    }
    // If t2 is not a valid type sub for t1, and already has a known
    // substitution return false since it is not possible for t1 to be a
    // substitution for t2.
    if (valid === false && t2HasSub === true) {
      return false;
    }
    // Otherwise, fall through to check whether t1 is a possible substitution
    // for t2.
  }
  if (kind1 === Kind.TYPEPARAM) {
    // Return whether t1 is a valid substitution for t2. If not, do no
    // additional checks as the possible type substitutions have been searched
    // in both directions.
    const [valid] = isValidTypeSubstitution(m, t2, t1);
    return valid;
  }
  // Next check for wildcard types.
  if (isDynOrError(t1) || isDynOrError(t2)) {
    return true;
  }
  // Preserve the nullness checks of the legacy type-checker.
  if (kind1 === Kind.NULL) {
    return internalIsAssignableNull(t2);
  }
  if (kind2 === Kind.NULL) {
    return internalIsAssignableNull(t1);
  }

  // Test for when the types do not need to agree, but are more specific than
  // dyn.
  switch (kind1) {
    case Kind.BOOL:
    case Kind.BYTES:
    case Kind.DOUBLE:
    case Kind.INT:
    case Kind.STRING:
    case Kind.UINT:
    case Kind.ANY:
    case Kind.DURATION:
    case Kind.TIMESTAMP:
    case Kind.STRUCT:
      // Test whether t2 is assignable from t1. The order of this check won't
      // usually matter; however, there may be cases where type capabilities
      // are expanded beyond what is supported in the current common/types
      // package. For example, an interface designation for a group of Struct
      // types.
      return t2.isAssignableType(t1);
    case Kind.TYPE:
      return kind2 === Kind.TYPE;
    case Kind.OPAQUE:
    case Kind.LIST:
    case Kind.MAP:
      return (
        t1.kind() === t2.kind() &&
        t1.typeName() === t2.typeName() &&
        internalIsAssignableList(m, t1.parameters(), t2.parameters())
      );
    default:
      return false;
  }
}

/**
 * isValidTypeSubstitution returns whether t2 (or its type substitution) is a
 * valid type substitution for t1, and whether t2 has a type substitution in
 * mapping m.
 *
 * The type t2 is a valid substitution for t1 if any of the following
 * statements is true:
 *
 * - t2 has a type substitution (t2sub) equal to t1
 * - t2 has a type substitution (t2sub) assignable to t1
 * - t2 does not occur within t1.
 */
function isValidTypeSubstitution(
  m: Mapping,
  t1: Type,
  t2: Type
): [boolean, boolean] {
  const kind1 = t1.kind();
  const kind2 = t2.kind();
  // Early return if the t1 and t2 are the same instance.
  if (kind1 === kind2 && t1.isExactType(t2)) {
    return [true, true];
  }
  const t2Sub = m.find(t2);
  if (!isNil(t2Sub)) {
    // Early return if t1 and t2Sub are the same instance as otherwise the
    // mapping might mark a type as being a subtitution for itself.
    if (kind1 === t2Sub.kind() && t1.isExactType(t2Sub)) {
      return [true, true];
    }
    // If the types are compatible, pick the more general type and return true
    if (internalIsAssignable(m, t1, t2Sub)) {
      const t2New = mostGeneral(t1, t2Sub);
      // only update the type reference map if the target type does not occur
      // within it.
      if (notReferencedIn(m, t2, t2New)) {
        m.add(t2, t2New);
      }
      // acknowledge the type agreement, and that the substitution is already
      // tracked.
      return [true, true];
    }
    return [false, true];
  }
  if (notReferencedIn(m, t2, t1)) {
    m.add(t2, t1);
    return [true, false];
  }
  return [false, false];
}

/**
 * internalIsAssignableList returns true if the element types at each index in
 * the list are assignable from l1[i] to l2[i]. The list lengths must also
 * agree for the lists to be assignable.
 */
function internalIsAssignableList(m: Mapping, l1: Type[], l2: Type[]): boolean {
  if (l1.length !== l2.length) {
    return false;
  }
  for (let i = 0; i < l1.length; i++) {
    if (!internalIsAssignable(m, l1[i], l2[i])) {
      return false;
    }
  }
  return false;
}

/**
 * internalIsAssignableNull returns true if the type is nullable.
 */
function internalIsAssignableNull(t: Type): boolean {
  return isLegacyNullable(t) || t.isAssignableType(NullType);
}

/**
 * isLegacyNullable preserves the null-ness compatibility of the original
 * type-checker implementation.
 */
function isLegacyNullable(t: Type): boolean {
  switch (t.kind()) {
    case Kind.OPAQUE:
    case Kind.STRUCT:
    case Kind.ANY:
    case Kind.TIMESTAMP:
    case Kind.DURATION:
      return true;
    default:
      return false;
  }
}

/**
 * isAssignable returns an updated type substitution mapping if t1 is
 * assignable to t2.
 */
export function isAssignable(m: Mapping, t1: Type, t2: Type): Mapping | null {
  const mCopy = m.copy();
  if (internalIsAssignable(mCopy, t1, t2)) {
    return mCopy;
  }
  return null;
}

/**
 * isAssignableList returns an updated type substitution mapping if l1 is
 * assignable to l2.
 */
export function isAssignableList(
  m: Mapping,
  l1: Type[],
  l2: Type[]
): Mapping | null {
  const mCopy = m.copy();
  if (internalIsAssignableList(mCopy, l1, l2)) {
    return mCopy;
  }
  return null;
}

/**
 * mostGeneral returns the more general of two types which are known to unify.
 */
function mostGeneral(t1: Type, t2: Type) {
  if (isEqualOrLessSpecific(t1, t2)) {
    return t1;
  }
  return t2;
}

/**
 * notReferencedIn checks whether the type doesn't appear directly or
 * transitively within the other type. This is a standard requirement for type
 * unification, commonly referred to as the "occurs check".
 */
function notReferencedIn(m: Mapping, t: Type, withinType: Type): boolean {
  if (t.isExactType(withinType)) {
    return false;
  }
  switch (withinType.kind()) {
    case Kind.TYPEPARAM:
      const wtSub = m.find(withinType);
      if (isNil(wtSub)) {
        return true;
      }
      return notReferencedIn(m, t, wtSub);
    case Kind.OPAQUE:
    case Kind.LIST:
    case Kind.MAP:
    case Kind.TYPE:
      for (const pt of withinType.parameters()) {
        if (!notReferencedIn(m, t, pt)) {
          return false;
        }
      }
      return true;
    default:
      return true;
  }
}

/**
 * substitute replaces all direct and indirect occurrences of bound type
 * parameters. Unbound type parameters are replaced by DYN if typeParamToDyn is
 * true.
 */
export function substitute(m: Mapping, t: Type, typeParamToDyn: boolean): Type {
  const tSub = m.find(t);
  if (!isNil(tSub)) {
    return substitute(m, tSub, typeParamToDyn);
  }
  if (typeParamToDyn === true && t.kind() === Kind.TYPEPARAM) {
    return DynType;
  }
  switch (t.kind()) {
    case Kind.OPAQUE:
      return newOpaqueType(
        t.typeName(),
        ...substituteParams(m, t.parameters(), typeParamToDyn)
      );
    case Kind.LIST:
      return newListType(substitute(m, t.parameters()[0], typeParamToDyn));
    case Kind.MAP:
      return newMapType(
        substitute(m, t.parameters()[0], typeParamToDyn),
        substitute(m, t.parameters()[1], typeParamToDyn)
      );
    case Kind.TYPE:
      if (t.parameters().length > 0) {
        const tParam = t.parameters()[0];
        return newTypeTypeWithParam(substitute(m, tParam, typeParamToDyn));
      }
      return t;
    default:
      return t;
  }
}

function substituteParams(
  m: Mapping,
  typeParams: Type[],
  typeParamToDyn: boolean
): Type[] {
  return typeParams.map((t) => substitute(m, t, typeParamToDyn));
}

export function newFunctionType(resultType: Type, ...argTypes: Type[]): Type {
  return newOpaqueType('function', resultType, ...argTypes);
}
