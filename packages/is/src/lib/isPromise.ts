import { assert } from './assert';
import { validate } from './validate';
import { ValidationException } from './ValidationException';

/**
 * Is the value a promise?
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
 *
 * @example
 * ```ts
 * isPromise(Promise.resolve(a)) // true
 * isPromise(() => 'a') // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
export const isPromise = <T>(
  value: unknown | Promise<T>
): value is Promise<T> => {
  return Object.prototype.toString.call(value) === '[object Promise]';
};

/**
 * Validate that the value is a promise.
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
 *
 * @example
 * ```ts
 * validatePromise(Promise.resolve(a)) // null
 * validatePromise(() => 'a') // ValidationException
 * ```
 *
 * @param value the value to check
 * @returns `null` the value is the expected type or a `ValidationException` if
 * not
 */
export const validatePromise = (value: unknown): ValidationException | null =>
  validate(isPromise(value), 'isPromise');

/**
 * Assert that the value is a promise.
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
 *
 * @example
 * ```ts
 * assertPromise(Promise.resolve(a)) // void
 * assertPromise(() => 'a') // throws AssertionException
 * ```
 *
 * @param value the value to check
 * @throws an `AssertionException` if the value is not the expected type
 */
export const assertPromise = <T>(
  value: unknown | Promise<T>
): asserts value is Promise<T> => assert(isPromise(value), 'isPromise');
