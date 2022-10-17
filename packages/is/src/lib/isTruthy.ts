import { assert } from './assert';
import { isFalsy } from './isFalsy';
import { validate } from './validate';
import { ValidationException } from './ValidationException';

/**
 * Is the value truthy?
 * See: https://developer.mozilla.org/en-US/docs/Glossary/Truthy
 *
 * @example
 * ```ts
 * isTruthy(1) // true
 * isTruthy(0) // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
export const isTruthy = (value: unknown): boolean => {
  return !isFalsy(value);
};

/**
 * Validate that the value is truthy.
 * See: https://developer.mozilla.org/en-US/docs/Glossary/Truthy
 *
 * @example
 * ```ts
 * validateTruthy(1) // null
 * validateTruthy(0) // ValidationException
 * ```
 *
 * @param value the value to check
 * @returns `null` the value is the expected type or a `ValidationException` if
 * not
 */
export const validateTruthy = (value: unknown): ValidationException | null =>
  validate(isTruthy(value), 'isTruthy');

/**
 * Assert that the value is truthy.
 * See: https://developer.mozilla.org/en-US/docs/Glossary/Truthy
 *
 * @example
 * ```ts
 * assertTruthy(1) // void
 * assertTruthy(0) // throws AssertionException
 * ```
 *
 * @param value the value to check
 * @throws an `AssertionException` if the value is not the expected type
 */
export const assertTruthy = (value: unknown): void =>
  assert(isTruthy(value), 'isTruthy');
