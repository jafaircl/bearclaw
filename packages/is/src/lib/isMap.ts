import { assert } from './assert';
import { validate } from './validate';
import { ValidationException } from './ValidationException';

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

/**
 * Validate that the value is a Map.
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
 *
 * @example
 * ```ts
 * validateMap(new Map()) // null
 * validateMap(1) // ValidationException
 * ```
 *
 * @param value the value to check
 * @returns `null` the value is the expected type or a `ValidationException` if
 * not
 */
export const validateMap = (value: unknown): ValidationException | null =>
  validate(isMap(value), 'isMap');

/**
 * Assert that the value is a Map.
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
 *
 * @example
 * ```ts
 * assertMap(new Map()) // void
 * assertMap(1) // throws AssertionException
 * ```
 *
 * @param value the value to check
 * @throws an `AssertionException` if the value is not the expected type
 */
export const assertMap = <K, V>(
  value: unknown | Map<K, V>
): asserts value is Map<K, V> => assert(isMap(value), 'isMap');
