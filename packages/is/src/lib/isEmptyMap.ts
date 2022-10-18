import { assert } from './assert';
import { isMap } from './isMap';
import { validate } from './validate';
import { ValidationException } from './ValidationException';

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

/**
 * Validate that the value is a Map with no entries.
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
 *
 * @example
 * ```ts
 * validateEmptyMap(new Map()) // null
 * validateEmptyMap(new Map([['foo', 'bar']])) // ValidationException
 * ```
 *
 * @param value the value to check
 * @returns `null` if the value is the expected type or a `ValidationException`
 * if not
 */
export const validateEmptyMap = (value: unknown): ValidationException | null =>
  validate(isEmptyMap(value), 'isEmptyMap');

/**
 * Assert that the value is a Map with no entries.
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
 *
 * @example
 * ```ts
 * assertEmptyMap(new Map()) // void
 * assertEmptyMap(new Map([['foo', 'bar']])) // throws AssertionException
 * ```
 *
 * @param value the value to check
 * @throws an `AssertionException` if the value is not the expected type
 */
export const assertEmptyMap = <K, V>(
  value: unknown | Map<K, V>
): asserts value is Map<K, V> => assert(isEmptyMap(value), 'isEmptyMap');
