/**
 * Is the value a boolean?
 * See: https://developer.mozilla.org/en-US/docs/Glossary/Boolean
 *
 * @example
 * ```ts
 * isBoolean(true) // true
 * isBoolean(1) // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
export const isBoolean = (value: unknown): value is boolean => {
  return Object.prototype.toString.call(value) === '[object Boolean]';
};
