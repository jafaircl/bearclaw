import { assert } from './assert';
import { isEmptyString } from './isEmptyString';
import { isNil } from './isNil';
import { isNumber } from './isNumber';
import { Primitive } from './isPrimitive';
import { validate } from './validate';
import { ValidationException } from './ValidationException';

/**
 * Is the value an empty string, null, undefined or NaN?
 *
 * @example
 * ```ts
 * isEmptyPrimitive('') // true
 * isEmptyPrimitive('example') // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
export const isEmptyPrimitive = (value: unknown): value is Primitive =>
  isEmptyString(value) || isNil(value) || (isNumber(value) && isNaN(value));

/**
 * Validate that the value is an empty string, null, undefined or NaN.
 *
 * @example
 * ```ts
 * validateEmptyPrimitive('') // null
 * validateEmptyPrimitive('example') // ValidationException
 * ```
 *
 * @param value the value to check
 * @returns `null` if the value is the expected type or a `ValidationException`
 * if not
 */
export const validateEmptyPrimitive = (
  value: unknown
): ValidationException | null =>
  validate(isEmptyPrimitive(value), 'isEmptyPrimitive');

/**
 * Assert that the value is an empty string, null, undefined or NaN.
 *
 * @example
 * ```ts
 * assertEmptyPrimitive('') // void
 * assertEmptyPrimitive('example') // throws AssertionException
 * ```
 *
 * @param value the value to check
 * @throws an `AssertionException` if the value is not the expected type
 */
export const assertEmptyPrimitive = (
  value: unknown
): asserts value is Primitive =>
  assert(isEmptyPrimitive(value), 'isEmptyPrimitive');
