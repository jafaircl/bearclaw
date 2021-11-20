import { isArray } from './isArray';

/**
 * Is the value an array with no values?
 * See: https://developer.mozilla.org/en-US/docs/Glossary/array
 *
 * @example
 * ```ts
 * isEmptyArray([]) // true
 * isEmptyArray(['1']) // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
export const isEmptyArray = <T>(value: unknown | T[]): value is T[] => {
  return isArray(value) && value.length === 0;
};
