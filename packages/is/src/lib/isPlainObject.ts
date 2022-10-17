import { assert } from './assert';
import { isNull } from './isNull';
import { isObject } from './isObject';
import { validate } from './validate';
import { ValidationException } from './ValidationException';

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

/**
 * Validate that the value is a plain object.
 * See: https://masteringjs.io/tutorials/fundamentals/pojo
 *
 * @example
 * ```ts
 * validatePlainObject({}) // null
 * validatePlainObject(new Person()) // ValidationException
 * ```
 *
 * @param value the value to check
 * @returns `null` the value is the expected type or a `ValidationException` if
 * not
 */
export const validatePlainObject = (
  value: unknown
): ValidationException | null =>
  validate(isPlainObject(value), 'isPlainObject');

/**
 * Assert that the value is a plain object.
 * See: https://masteringjs.io/tutorials/fundamentals/pojo
 *
 * @example
 * ```ts
 * assertPlainObject({}) // void
 * assertPlainObject(new Person()) // throws AssertionException
 * ```
 *
 * @param value the value to check
 * @throws an `AssertionException` if the value is not the expected type
 */
export const assertPlainObject = <K extends string | number | symbol, V>(
  value: unknown | Record<K, V>
): asserts value is Record<K, V> =>
  assert(isPlainObject(value), 'isPlainObject');
