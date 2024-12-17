import { assert } from './assert';
import { isNil } from './isNil';
import { validate } from './validate';
import { ValidationException } from './ValidationException';

/**
 * Is the value bindable? Arrow functions, constructors and functions that are
 * already bound will not be bindable.
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_objects/Function/bind
 *
 * @example
 * ```ts
 * isBindable(function () {}) // true
 * isBindable(function () { return 'a'; }.bind(this)) // false
 * isBindable(() => 'a') // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
// eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any
export const isBindable = (value: any): value is Function => {
  // eslint-disable-next-line no-prototype-builtins
  return !isNil(value) && value.hasOwnProperty('prototype');
};

/**
 * Validate that the value is bindable. Arrow functions, constructors and
 * functions that are already bound will not be bindable.
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_objects/Function/bind
 *
 * @example
 * ```ts
 * validateBindable(function () {}) // null
 * validateBindable(someFunction.bind(this)) // ValidationException
 * validateBindable(() => 'a') // ValidationException
 * ```
 *
 * @param value the value to check
 * @returns `null` if the value is the expected type or a `ValidationException`
 * if not
 */
export const validateBindable = (
  value: unknown
): ValidationException | null => {
  return validate(isBindable(value), 'isBindable');
};

/**
 * Assert that the value is bindable. Arrow functions, constructors and
 * functions that are already bound will not be bindable.
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_objects/Function/bind
 *
 * @example
 * ```ts
 * assertBindable(function () {}) // void
 * assertBindable(someFunction.bind(this)) // throws AssertionException
 * assertBindable(() => 'a') // throws AssertionException
 * ```
 *
 * @param value the value to check
 * @throws an `AssertionException` if the value is not the expected type
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export const assertBindable = (value: unknown): asserts value is Function =>
  assert(isBindable(value), 'isBindable');
