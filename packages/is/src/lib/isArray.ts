/**
 * Is the value an Array?
 * See: https://developer.mozilla.org/en-US/docs/Glossary/array
 *
 * @example
 * ```ts
 * isArray([1]) // true
 * isArray(1) // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
export const isArray = <T>(value: unknown | T[]): value is T[] => {
  return Array.isArray(value);
};
