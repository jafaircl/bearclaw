import { assert } from './assert';
import { validate } from './validate';
import { ValidationException } from './ValidationException';

/**
 * Is the value a WeakSet?
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet
 *
 * @example
 * ```ts
 * isWeakSet(new WeakSet()) // true
 * isWeakSet(1) // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
export const isWeakSet = <T extends Record<string, unknown>>(
  value: unknown | WeakSet<T>
): value is WeakSet<T> => {
  return Object.prototype.toString.call(value) === '[object WeakSet]';
};

/**
 * Validate that the value is a WeakSet.
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet
 *
 * @example
 * ```ts
 * validateWeakSet(new WeakSet()) // null
 * validateWeakSet(1) // ValidationException
 * ```
 *
 * @param value the value to check
 * @returns `null` the value is the expected type or a `ValidationException` if
 * not
 */
export const validateWeakSet = (value: unknown): ValidationException | null =>
  validate(isWeakSet(value), 'isWeakSet');

/**
 * Assert that the value is a WeakSet.
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet
 *
 * @example
 * ```ts
 * assertWeakSet(new WeakSet()) // void
 * assertWeakSet(1) // throws AssertionException
 * ```
 *
 * @param value the value to check
 * @throws an `AssertionException` if the value is not the expected type
 */
export const assertWeakSet = <T extends Record<string, unknown>>(
  value: unknown | WeakSet<T>
): asserts value is WeakSet<T> => assert(isWeakSet(value), 'isWeakSet');
