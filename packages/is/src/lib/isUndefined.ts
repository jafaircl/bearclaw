/**
 * Is the value undefined?
 * See: https://developer.mozilla.org/en-US/docs/Glossary/undefined
 *
 * @example
 * ```ts
 * isUndefined(undefined) // true
 * isUndefined(1) // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
export const isUndefined = (value: unknown): value is undefined => {
  return value === undefined;
};
