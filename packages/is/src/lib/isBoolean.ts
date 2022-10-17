import { assert } from './assert';
import { validate } from './validate';
import { ValidationException } from './ValidationException';

/**
 * Is the value a boolean?
 * See: https://developer.mozilla.org/en-US/docs/Glossary/Boolean
 *
 * @example
 * ```ts
 * isBoolean(true) // true
 * isBoolean(1) // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
export const isBoolean = (value: unknown): value is boolean => {
  return Object.prototype.toString.call(value) === '[object Boolean]';
};

/**
 * Validate that the value is a boolean.
 * See: https://developer.mozilla.org/en-US/docs/Glossary/Boolean
 *
 * @example
 * ```ts
 * validateBoolean(true) // null
 * validateBoolean(1) // ValidationException
 * ```
 *
 * @param value the value to check
 * @returns `null` the value is the expected type or a `ValidationException` if
 * not
 */
export const validateBoolean = (value: unknown): ValidationException | null =>
  validate(isBoolean(value), 'isBoolean');

/**
 * Assert that the value is a boolean.
 * See: https://developer.mozilla.org/en-US/docs/Glossary/Boolean
 *
 * @example
 * ```ts
 * assertBoolean(true) // void
 * assertBoolean(1) // throws AssertionException
 * ```
 *
 * @param value the value to check
 * @throws an `AssertionException` if the value is not the expected type
 */
export const assertBoolean = (value: unknown): asserts value is boolean =>
  assert(isBoolean(value), 'isBoolean');
