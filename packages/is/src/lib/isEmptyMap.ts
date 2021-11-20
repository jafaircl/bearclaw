import { isMap } from './isMap';

/**
 * Is the value a Map with no entries?
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
 *
 * @example
 * ```ts
 * isEmptyMap(new Map()) // true
 * isEmptyMap(new Map([['foo', 'bar']])) // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
export const isEmptyMap = <K, V>(
  value: unknown | Map<K, V>
): value is Map<K, V> => {
  return isMap(value) && value.size === 0;
};
