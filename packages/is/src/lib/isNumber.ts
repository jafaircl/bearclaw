import { assert } from './assert';
import { isType } from './isType';
import { validate } from './validate';
import { ValidationException } from './ValidationException';

/**
 * Is the value a number?
 * See: https://developer.mozilla.org/en-US/docs/Glossary/Number
 *
 * @example
 * ```ts
 * isNumber(1) // true
 * isNumber('') // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
export const isNumber = (value: unknown): value is number =>
  isType('Number', value);

/**
 * Validate that the value is a number.
 * See: https://developer.mozilla.org/en-US/docs/Glossary/Number
 *
 * @example
 * ```ts
 * validateNumber(1) // null
 * validateNumber('') // ValidationException
 * ```
 *
 * @param value the value to check
 * @returns `null` if the value is the expected type or a `ValidationException`
 * if not
 */
export const validateNumber = (value: unknown): ValidationException | null =>
  validate(isNumber(value), 'isNumber');

/**
 * Assert that the value is a number.
 * See: https://developer.mozilla.org/en-US/docs/Glossary/Number
 *
 * @example
 * ```ts
 * assertNumber(1) // void
 * assertNumber('') // throws AssertionException
 * ```
 *
 * @param value the value to check
 * @throws an `AssertionException` if the value is not the expected type
 */
export const assertNumber = (value: unknown): asserts value is number =>
  assert(isNumber(value), 'isNumber');
