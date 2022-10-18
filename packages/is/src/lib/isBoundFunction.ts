import { assert } from './assert';
import { isBindable } from './isBindable';
import { isFunction } from './isFunction';
import { validate } from './validate';
import { ValidationException } from './ValidationException';

/**
 * Is the value a bound function?
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_objects/Function/bind
 *
 * @example
 * ```ts
 * isBoundFunction(function () { return 'a'; }.bind(this)) // true
 * isBoundFunction(function () {}) // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export const isBoundFunction = (value: unknown): value is Function => {
  return isFunction(value) && !isBindable(value);
};

/**
 * Validate that the value is a bound function.
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_objects/Function/bind
 *
 * @example
 * ```ts
 * validateBoundFunction(someFunction.bind(this)) // null
 * validateBoundFunction(function () {}) // ValidationException
 * ```
 *
 * @param value the value to check
 * @returns `null` if the value is the expected type or a `ValidationException`
 * if not
 */
export const validateBoundFunction = (
  value: unknown
): ValidationException | null => {
  return validate(isBoundFunction(value), 'isBoundFunction');
};

/**
 * Assert that the value is a bound function.
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_objects/Function/bind
 *
 * @example
 * ```ts
 * assertBoundFunction(someFunction.bind(this)) // void
 * assertBoundFunction(function () {}) // throws AssertionException
 * ```
 *
 * @param value the value to check
 * @throws an `AssertionException` if the value is not the expected type
 */
export const assertBoundFunction = (
  value: unknown
  // eslint-disable-next-line @typescript-eslint/ban-types
): asserts value is Function =>
  assert(isBoundFunction(value), 'isBoundFunction');
