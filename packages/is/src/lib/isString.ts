/**
 * Is the value a sequence of characters?
 * See: https://developer.mozilla.org/en-US/docs/Glossary/String
 *
 * @example
 * ```ts
 * isString('') // true
 * isString(1) // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
export const isString = (value: unknown): value is string => {
  return Object.prototype.toString.call(value) === '[object String]';
};
