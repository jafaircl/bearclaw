import { assert } from './assert';
import { isString } from './isString';
import { validate } from './validate';
import { ValidationException } from './ValidationException';

/**
 * Is the value a string with no characters?
 * See: https://developer.mozilla.org/en-US/docs/Glossary/String
 *
 * @example
 * ```ts
 * isEmptyString('') // true
 * isEmptyString('1') // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
export const isEmptyString = (value: unknown): value is string => {
  return isString(value) && value.length === 0;
};

/**
 * Validate that the value is a string with no characters.
 * See: https://developer.mozilla.org/en-US/docs/Glossary/String
 *
 * @example
 * ```ts
 * validateEmptyString('') // null
 * validateEmptyString('1') // ValidationException
 * ```
 *
 * @param value the value to check
 * @returns `null` if the value is the expected type or a `ValidationException`
 * if not
 */
export const validateEmptyString = (
  value: unknown
): ValidationException | null =>
  validate(isEmptyString(value), 'isEmptyString');

/**
 * Assert that the value is a string with no characters.
 * See: https://developer.mozilla.org/en-US/docs/Glossary/String
 *
 * @example
 * ```ts
 * assertEmptyString('') // void
 * assertEmptyString('1') // throws AssertionException
 * ```
 *
 * @param value the value to check
 * @throws an `AssertionException` if the value is not the expected type
 */
export const assertEmptyString = (value: unknown): asserts value is string =>
  assert(isEmptyString(value), 'isEmptyString');
