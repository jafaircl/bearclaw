import { assert } from './assert';
import { validate } from './validate';
import { ValidationException } from './ValidationException';
export type Falsy = false | 0 | -0 | 0n | '' | null | undefined | typeof NaN;

/**
 * Is the value falsy?
 * See: https://developer.mozilla.org/en-US/docs/Glossary/Falsy
 *
 * @example
 * ```ts
 * isFalsy(0) // true
 * isFalsy(1) // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
export const isFalsy = (value: unknown): value is Falsy => {
  if (!value) {
    return true;
  }
  return false;
};

/**
 * Validate that the value is falsy.
 * See: https://developer.mozilla.org/en-US/docs/Glossary/Falsy
 *
 * @example
 * ```ts
 * validateFalsy(0) // null
 * validateFalsy(1) // ValidationException
 * ```
 *
 * @param value the value to check
 * @returns `null` if the value is the expected type or a `ValidationException`
 * if not
 */
export const validateFalsy = (value: unknown): ValidationException | null =>
  validate(isFalsy(value), 'isFalsy');

/**
 * Assert that the value is falsy.
 * See: https://developer.mozilla.org/en-US/docs/Glossary/Falsy
 *
 * @example
 * ```ts
 * assertFalsy(0) // void
 * assertFalsy(1) // throws AssertionException
 * ```
 *
 * @param value the value to check
 * @throws an `AssertionException` if the value is not the expected type
 */
export const assertFalsy = (value: unknown): asserts value is Falsy =>
  assert(isFalsy(value), 'isFalsy');
