/**
 * Is the value a Map?
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
 *
 * @example
 * ```ts
 * isMap(new Map()) // true
 * isMap(1) // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
export const isMap = <K, V>(value: unknown | Map<K, V>): value is Map<K, V> => {
  return Object.prototype.toString.call(value) === '[object Map]';
};
