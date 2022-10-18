import { assert } from './assert';
import { validate } from './validate';
import { ValidationException } from './ValidationException';

/**
 * Is the value an Array?
 * See: https://developer.mozilla.org/en-US/docs/Glossary/array
 *
 * @example
 * ```ts
 * isArray([1]) // true
 * isArray(1) // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
export const isArray = <T>(value: unknown | T[]): value is T[] => {
  return Array.isArray(value);
};

/**
 * Validate that the value is an Array.
 * See: https://developer.mozilla.org/en-US/docs/Glossary/array
 *
 * @example
 * ```ts
 * validateArray([1]) // null
 * validateArray(1) // ValidationException
 * ```
 *
 * @param value the value to check
 * @returns `null` if the value is the expected type or a `ValidationException`
 * if not
 */
export const validateArray = <T>(
  value: unknown | T[]
): ValidationException | null => validate(isArray(value), 'isArray');

/**
 * Assert that the value is an Array.
 * See: https://developer.mozilla.org/en-US/docs/Glossary/array
 *
 * @example
 * ```ts
 * assertArray([1]) // void
 * assertArray(1) // throws AssertionException
 * ```
 *
 * @param value the value to check
 * @throws an `AssertionException` if the value is not the expected type
 */
export const assertArray = <T>(value: unknown | T[]): asserts value is T[] =>
  assert(isArray(value), 'isArray');
