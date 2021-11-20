/**
 * Is the value a date object?
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
 *
 * @example
 * ```ts
 * isDateObject(new Date()) // true
 * isDateObject(function () {}) // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
export const isDateObject = (value: unknown): value is Date => {
  return Object.prototype.toString.call(value) === '[object Date]';
};
