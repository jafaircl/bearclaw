import { assert } from './assert';
import { isEmptyArray } from './isEmptyArray';
import { isEmptyMap } from './isEmptyMap';
import { isEmptyObject } from './isEmptyObject';
import { isEmptySet } from './isEmptySet';
import { isPrimitive } from './isPrimitive';
import { validate } from './validate';
import { ValidationException } from './ValidationException';

/**
 * Is the value an array, map, object or set with no values?
 *
 * @example
 * ```ts
 * isEmptyStructural([]) // true
 * isEmptyStructural(['example']) // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
export const isEmptyStructural = (value: unknown): boolean => {
  if (isPrimitive(value)) {
    return false;
  }
  return (
    isEmptyArray(value) ||
    isEmptyMap(value) ||
    isEmptyObject(value) ||
    isEmptySet(value)
  );
};

/**
 * Validate that the value is an array, map, object or set with no values.
 *
 * @example
 * ```ts
 * validateEmptyStructural([]) // null
 * validateEmptyStructural(['example']) // ValidationException
 * ```
 *
 * @param value the value to check
 * @returns `null` if the value is the expected type or a `ValidationException`
 * if not
 */
export const validateEmptyStructural = (
  value: unknown
): ValidationException | null =>
  validate(isEmptyStructural(value), 'isEmptyStructural');

/**
 * Assert that the value is an array, map, object or set with no values.
 *
 * @example
 * ```ts
 * assertEmptyStructural([]) // void
 * assertEmptyStructural(['example']) // throws AssertionException
 * ```
 *
 * @param value the value to check
 * @throws an `AssertionException` if the value is not the expected type
 */
export const assertEmptyStructural = (value: unknown): void =>
  assert(isEmptyStructural(value), 'isEmptyStructural');
