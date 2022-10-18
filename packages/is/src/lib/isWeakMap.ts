import { assert } from './assert';
import { isType } from './isType';
import { validate } from './validate';
import { ValidationException } from './ValidationException';

/**
 * Is the value a WeakMap?
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap
 *
 * @example
 * ```ts
 * isWeakMap(new WeakMap()) // true
 * isWeakMap(1) // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
export const isWeakMap = <K extends Record<string, unknown>, V>(
  value: unknown | WeakMap<K, V>
): value is WeakMap<K, V> => isType('WeakMap', value);

/**
 * Validate that the value is a WeakMap.
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap
 *
 * @example
 * ```ts
 * validateWeakMap(new WeakMap()) // null
 * validateWeakMap(1) // ValidationException
 * ```
 *
 * @param value the value to check
 * @returns `null` if the value is the expected type or a `ValidationException`
 * if not
 */
export const validateWeakMap = (value: unknown): ValidationException | null =>
  validate(isWeakMap(value), 'isWeakMap');

/**
 * Assert that the value is a WeakMap.
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap
 *
 * @example
 * ```ts
 * assertWeakMap(new WeakMap()) // void
 * assertWeakMap(1) // throws AssertionException
 * ```
 *
 * @param value the value to check
 * @throws an `AssertionException` if the value is not the expected type
 */
export const assertWeakMap = <K extends Record<string, unknown>, V>(
  value: unknown | WeakMap<K, V>
): asserts value is WeakMap<K, V> => assert(isWeakMap(value), 'isWeakMap');
