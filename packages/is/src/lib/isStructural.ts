import { isPrimitive } from '..';

/**
 * Is the value a structural type (object)?
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#objects
 *
 * @example
 * ```ts
 * isStructural({}) // true
 * isStructural(1) // false
 * ```
 *
 * @param value
 * @returns
 */
export const isStructural = (value: unknown): boolean => {
  return !isPrimitive(value);
};
