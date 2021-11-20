import { isPrimitive } from '..';

/**
 * Is the value immutable?
 * See: https://developer.mozilla.org/en-US/docs/Glossary/Mutable
 *
 * ```ts
 * isImmutable(Object.freeze({})) // true
 * isImmutable({}) // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
export const isImmutable = (value: unknown): boolean => {
  if (isPrimitive(value)) {
    return true;
  }
  return Object.isFrozen(value);
};
