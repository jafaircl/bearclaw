/**
 * Is the value a WeakSet?
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet
 *
 * @example
 * ```ts
 * isWeakSet(new WeakSet()) // true
 * isWeakSet(1) // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
export const isWeakSet = <T extends Record<string, unknown>>(
  value: unknown | WeakSet<T>
): value is WeakSet<T> => {
  return Object.prototype.toString.call(value) === '[object WeakSet]';
};
