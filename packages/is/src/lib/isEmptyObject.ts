import { assert } from './assert';
import { isPlainObject } from './isPlainObject';
import { validate } from './validate';
import { ValidationException } from './ValidationException';

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

/**
 * Validate that the value is a plain object with no entries.
 * See: https://masteringjs.io/tutorials/fundamentals/pojo
 *
 * @example
 * ```ts
 * validateEmptyObject({}) // null
 * validateEmptyObject({ foo: 'bar' }) // ValidationException
 * ```
 *
 * @param value the value to check
 * @returns `null` if the value is the expected type or a `ValidationException`
 * if not
 */
export const validateEmptyObject = (
  value: unknown
): ValidationException | null =>
  validate(isEmptyObject(value), 'isEmptyObject');

/**
 * Assert that the value is a plain object with no entries.
 * See: https://masteringjs.io/tutorials/fundamentals/pojo
 *
 * @example
 * ```ts
 * assertEmptyObject({}) // void
 * assertEmptyObject({ foo: 'bar' }) // throws AssertionException
 * ```
 *
 * @param value the value to check
 * @throws an `AssertionException` if the value is not the expected type
 */
export const assertEmptyObject = <K extends string | number | symbol, V>(
  value: unknown | Record<K, V>
): asserts value is Record<K, V> =>
  assert(isEmptyObject(value), 'isEmptyObject');
