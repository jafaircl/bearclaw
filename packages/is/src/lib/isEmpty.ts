import { assert } from './assert';
import { isEmptyPrimitive } from './isEmptyPrimitive';
import { isEmptyStructural } from './isEmptyStructural';
import { validate } from './validate';
import { ValidationException } from './ValidationException';

/**
 * Is the value an empty string, null, undefined, NaN or an array, map, object
 * or set with no values?
 *
 * @example
 * ```ts
 * isEmpty('') // true
 * isEmpty([]) // true
 * isEmpty('example') // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
export const isEmpty = (value: unknown): boolean =>
  isEmptyPrimitive(value) || isEmptyStructural(value);

/**
 * Validate that the value is an empty string, null, undefined, NaN or an
 * array, map, object or set with no values.
 *
 * @example
 * ```ts
 * validateEmpty('') // true
 * validateEmpty([]) // true
 * validateEmpty('example') // false
 * ```
 *
 * @param value the value to check
 * @returns `null` if the value is the expected type or a `ValidationException`
 * if not
 */
export const validateEmpty = (value: unknown): ValidationException | null =>
  validate(isEmpty(value), 'isEmpty');

/**
 * Assert that the value is an empty string, null, undefined, NaN or an
 * array, map, object or set with no values.
 *
 * @example
 * ```ts
 * assertEmpty('') // true
 * assertEmpty([]) // true
 * assertEmpty('example') // false
 * ```
 *
 * @param value the value to check
 * @throws an `AssertionException` if the value is not the expected type
 */
export const assertEmpty = (value: unknown): void =>
  assert(isEmpty(value), 'isEmpty');
