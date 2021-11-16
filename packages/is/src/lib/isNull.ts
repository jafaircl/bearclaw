/**
 * Is the value null?
 * See: https://developer.mozilla.org/en-US/docs/Glossary/Null
 *
 * @example
 * ```ts
 * isNull(null) // true
 * isNull(1) // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
export const isNull = (value: unknown): value is null => {
  return value === null;
};
