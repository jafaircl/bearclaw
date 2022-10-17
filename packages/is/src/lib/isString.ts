import { assert } from './assert';
import { validate } from './validate';
import { ValidationException } from './ValidationException';

/**
 * Is the value a sequence of characters?
 * See: https://developer.mozilla.org/en-US/docs/Glossary/String
 *
 * @example
 * ```ts
 * isString('') // true
 * isString(1) // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
export const isString = (value: unknown): value is string => {
  return Object.prototype.toString.call(value) === '[object String]';
};

/**
 * Validate that the value is a sequence of characters.
 * See: https://developer.mozilla.org/en-US/docs/Glossary/String
 *
 * @example
 * ```ts
 * validateString('') // null
 * validateString(1) // ValidationException
 * ```
 *
 * @param value the value to check
 * @returns `null` the value is the expected type or a `ValidationException` if
 * not
 */
export const validateString = (value: unknown): ValidationException | null =>
  validate(isString(value), 'isString');

/**
 * Assert that the value is a sequence of characters.
 * See: https://developer.mozilla.org/en-US/docs/Glossary/String
 *
 * @example
 * ```ts
 * assertString('') // void
 * assertString(1) // throws AssertionException
 * ```
 *
 * @param value the value to check
 * @throws an `AssertionException` if the value is not the expected type
 */
export const assertString = (value: unknown): asserts value is string =>
  assert(isString(value), 'isString');
