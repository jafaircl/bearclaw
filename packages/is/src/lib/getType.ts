/**
 * Get a value's type. Uses `Object.prototype.toString` so it will not work
 * with custom classes unless `[Symbol.toStringTag]` is defined.
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures
 *
 * @example
 * ```ts
 * getType([]) // "Array"
 * getType(1) // "Number"
 * getType('1') // "String"
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
export const getType = (value: unknown): string =>
  Object.prototype.toString.call(value).slice(8, -1);
