import { assert } from './assert';
import { validate } from './validate';
import { ValidationException } from './ValidationException';

/**
 * Is the value undefined?
 * See: https://developer.mozilla.org/en-US/docs/Glossary/undefined
 *
 * @example
 * ```ts
 * isUndefined(undefined) // true
 * isUndefined(1) // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
export const isUndefined = (value: unknown): value is undefined => {
  return value === undefined;
};

/**
 * Validate that the value is undefined.
 * See: https://developer.mozilla.org/en-US/docs/Glossary/undefined
 *
 * @example
 * ```ts
 * validateUndefined(undefined) // null
 * validateUndefined(1) // ValidationException
 * ```
 *
 * @param value the value to check
 * @returns `null` the value is the expected type or a `ValidationException` if
 * not
 */
export const validateUndefined = (value: unknown): ValidationException | null =>
  validate(isUndefined(value), 'isUndefined');

/**
 * Assert that the value is undefined.
 * See: https://developer.mozilla.org/en-US/docs/Glossary/undefined
 *
 * @example
 * ```ts
 * assertUndefined(undefined) // void
 * assertUndefined(1) // throws AssertionException
 * ```
 *
 * @param value the value to check
 * @throws an `AssertionException` if the value is not the expected type
 */
export const assertUndefined = (value: unknown): asserts value is undefined =>
  assert(isUndefined(value), 'isUndefined');
