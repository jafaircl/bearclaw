import { assert } from './assert';
import { validate } from './validate';

/**
 * Is the value null?
 * See: https://developer.mozilla.org/en-US/docs/Glossary/Null
 *
 * @example
 * ```ts
 * isNull(null) // true
 * isNull(1) // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
export const isNull = (value: unknown): value is null => {
  return value === null;
};

/**
 * Validate that the value is null.
 * See: https://developer.mozilla.org/en-US/docs/Glossary/Null
 *
 * @example
 * ```ts
 * validateNull(null) // null
 * validateNull(1) // ValidationException
 * ```
 *
 * @param value the value to check
 * @returns `null` if the value is the expected type or a `ValidationException`
 * if not
 */
export const validateNull = (value: unknown) =>
  validate(isNull(value), 'isNull');

/**
 * Assert that the value is null.
 * See: https://developer.mozilla.org/en-US/docs/Glossary/Null
 *
 * @example
 * ```ts
 * assertNull(null) // void
 * assertNull(1) // throws AssertionException
 * ```
 *
 * @param value the value to check
 * @throws an `AssertionException` if the value is not the expected type
 */
export const assertNull = (value: unknown): asserts value is null =>
  assert(isNull(value), 'isNull');
