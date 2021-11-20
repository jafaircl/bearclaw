/**
 * Is the value a number?
 * See: https://developer.mozilla.org/en-US/docs/Glossary/Number
 *
 * @example
 * ```ts
 * isNumber(1) // true
 * isNumber('') // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
export const isNumber = (value: unknown): value is number => {
  return Object.prototype.toString.call(value) === '[object Number]';
};
