import { assert } from './assert';
import { isNull } from './isNull';
import { isUndefined } from './isUndefined';
import { validate } from './validate';
import { ValidationException } from './ValidationException';

/**
 * Is the value null or undefined?
 *
 * @example
 * ```ts
 * isNil(null) // true
 * isNil(undefined) // true
 * isNil(1) // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
export const isNil = (value: unknown): value is null | undefined => {
  return isNull(value) || isUndefined(value);
};

/**
 * Validate that the value is null or undefined.
 *
 * @example
 * ```ts
 * validateNil(null) // null
 * validateNil(undefined) // null
 * validateNil(1) // ValidationException
 * ```
 *
 * @param value the value to check
 * @returns `null` the value is the expected type or a `ValidationException` if
 * not
 */
export const validateNil = (value: unknown): ValidationException | null =>
  validate(isNil(value), 'isNil');

/**
 * Assert that the value is null or undefined.
 *
 * @example
 * ```ts
 * assertNil(null) // void
 * assertNil(undefined) // void
 * assertNil(1) // throws AssertionException
 * ```
 *
 * @param value the value to check
 * @throws an `AssertionException` if the value is not the expected type
 */
export const assertNil = (value: unknown): asserts value is null | undefined =>
  assert(isNil(value), 'isNil');
