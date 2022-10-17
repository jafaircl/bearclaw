import { assert } from './assert';
import { isBoundFunction } from './isBoundFunction';
import { validate } from './validate';
import { ValidationException } from './ValidationException';

/**
 * Is the value an arrow function?
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions
 *
 * @example
 * ```ts
 * isArrowFunction(() => 'a') // true
 * isArrowFunction(function () {}) // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export const isArrowFunction = (value: unknown): value is Function => {
  return (
    isBoundFunction(value) &&
    /^([^{=]+|\(.*\)\s*)?=>/.test(value.toString().replace(/\s/, ''))
  );
};

/**
 * Validate that the value is an arrow function.
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions
 *
 * @example
 * ```ts
 * validateArrowFunction(() => 'a') // null
 * validateArrowFunction(function () {}) // ValidationException
 * ```
 *
 * @param value the value to check
 * @returns `null` the value is the expected type or a `ValidationException` if
 * not
 */
export const validateArrowFunction = (
  value: unknown
): ValidationException | null =>
  validate(isArrowFunction(value), 'isArrowFunction');

/**
 * Assert that the value is an arrow function.
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions
 *
 * @example
 * ```ts
 * assertArrowFunction(() => 'a') // void
 * assertArrowFunction(function () {}) // throws AssertionException
 * ```
 *
 * @param value the value to check
 * @throws an `AssertionException` if the value is not the expected type
 */
export const assertArrowFunction = (
  value: unknown
  // eslint-disable-next-line @typescript-eslint/ban-types
): asserts value is Function =>
  assert(isArrowFunction(value), 'isArrowFunction');
