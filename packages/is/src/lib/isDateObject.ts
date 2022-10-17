import { assert } from './assert';
import { validate } from './validate';
import { ValidationException } from './ValidationException';

/**
 * Is the value a date object?
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
 *
 * @example
 * ```ts
 * isDateObject(new Date()) // true
 * isDateObject(function () {}) // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
export const isDateObject = (value: unknown): value is Date => {
  return Object.prototype.toString.call(value) === '[object Date]';
};

/**
 * Validate that the value is a date object.
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
 *
 * @example
 * ```ts
 * validateDateObject(new Date()) // null
 * validateDateObject(function () {}) // ValidationException
 * ```
 *
 * @param value the value to check
 * @returns `null` the value is the expected type or a `ValidationException` if
 * not
 */
export const validateDateObject = (
  value: unknown
): ValidationException | null => validate(isDateObject(value), 'isDateObject');

/**
 * Assert that the value is a date object.
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
 *
 * @example
 * ```ts
 * assertDateObject(new Date()) // void
 * assertDateObject(function () {}) // throws AssertionException
 * ```
 *
 * @param value the value to check
 * @throws an `AssertionException` if the value is not the expected type
 */
export const assertDateObject = (value: unknown): asserts value is Date =>
  assert(isDateObject(value), 'isDateObject');
