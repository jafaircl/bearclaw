import { isSet } from './isSet';

/**
 * Is the value a Set with no values?
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
 *
 * @example
 * ```ts
 * isEmptySet(new Set()) // true
 * isEmptySet(new Set([1])) // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
export const isEmptySet = <T>(value: unknown | Set<T>): value is Set<T> => {
  return isSet(value) && value.size === 0;
};
