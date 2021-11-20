/**
 * Is the value a WeakMap?
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap
 *
 * @example
 * ```ts
 * isWeakMap(new WeakMap()) // true
 * isMap(1) // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
export const isWeakMap = <K extends Record<string, unknown>, V>(
  value: unknown | WeakMap<K, V>
): value is WeakMap<K, V> => {
  return Object.prototype.toString.call(value) === '[object WeakMap]';
};
