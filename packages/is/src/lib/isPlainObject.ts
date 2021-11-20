import { isNull } from './isNull';
import { isObject } from './isObject';

/**
 * Is the value a plain object?
 * See: https://masteringjs.io/tutorials/fundamentals/pojo
 *
 * @example
 * ```ts
 * isPlainObject({}) // true
 * isPlainObject(new Person()) // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
export const isPlainObject = <K extends string | number | symbol, V>(
  value: unknown | Record<K, V>
): value is Record<K, V> => {
  if (!isObject(value)) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return isNull(prototype) || prototype.constructor.name === 'Object';
};
