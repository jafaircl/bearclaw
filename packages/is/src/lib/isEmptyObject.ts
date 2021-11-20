import { isPlainObject } from './isPlainObject';

/**
 * Is the value a plain object with no entries?
 * See: https://masteringjs.io/tutorials/fundamentals/pojo
 *
 * @example
 * ```ts
 * isEmptyObject({}) // true
 * isEmptyObject({ foo: 'bar' }) // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
export const isEmptyObject = <K extends string | number | symbol, V>(
  value: unknown | Record<K, V>
): value is Record<K, V> => {
  return isPlainObject(value) && Object.entries(value).length === 0;
};
