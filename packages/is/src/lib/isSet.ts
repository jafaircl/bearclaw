/**
 * Is the value a Set?
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
 *
 * @example
 * ```ts
 * isSet(new Set()) // true
 * isSet(1) // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
export const isSet = <T>(value: unknown | Set<T>): value is Set<T> => {
  return Object.prototype.toString.call(value) === '[object Set]';
};
