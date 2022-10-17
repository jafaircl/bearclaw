import { assert } from './assert';
import { isArray } from './isArray';
import { validate } from './validate';
import { ValidationException } from './ValidationException';

/**
 * Is the value an array with no values?
 * See: https://developer.mozilla.org/en-US/docs/Glossary/array
 *
 * @example
 * ```ts
 * isEmptyArray([]) // true
 * isEmptyArray(['1']) // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
export const isEmptyArray = <T>(value: unknown | T[]): value is T[] => {
  return isArray(value) && value.length === 0;
};

/**
 * Validate that the value is an array with no values.
 * See: https://developer.mozilla.org/en-US/docs/Glossary/array
 *
 * @example
 * ```ts
 * validateEmptyArray([]) // null
 * validateEmptyArray(['1']) // ValidationException
 * ```
 *
 * @param value the value to check
 * @returns `null` the value is the expected type or a `ValidationException` if
 * not
 */
export const validateEmptyArray = (
  value: unknown
): ValidationException | null => validate(isEmptyArray(value), 'isEmptyArray');

/**
 * Assert that the value is an array with no values.
 * See: https://developer.mozilla.org/en-US/docs/Glossary/array
 *
 * @example
 * ```ts
 * assertEmptyArray([]) // void
 * assertEmptyArray(['1']) // throws AssertionException
 * ```
 *
 * @param value the value to check
 * @throws an `AssertionException` if the value is not the expected type
 */
export const assertEmptyArray = <T>(
  value: unknown | T[]
): asserts value is T[] => assert(isEmptyArray(value), 'isEmptyArray');
