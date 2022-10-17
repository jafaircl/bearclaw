import { assert } from './assert';
import { validate } from './validate';
import { ValidationException } from './ValidationException';

/**
 * Is the value a function?
 * See: https://developer.mozilla.org/en-US/docs/Glossary/Function
 *
 * @example
 * ```ts
 * isFunction(() => 'a') // true
 * isFunction(1) // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export const isFunction = (value: unknown): value is Function => {
  return typeof value === 'function';
};

/**
 * Validate that the value is a function.
 * See: https://developer.mozilla.org/en-US/docs/Glossary/Function
 *
 * @example
 * ```ts
 * validateFunction(() => 'a') // null
 * validateFunction(1) // ValidationException
 * ```
 *
 * @param value the value to check
 * @returns `null` the value is the expected type or a `ValidationException` if
 * not
 */
export const validateFunction = (value: unknown): ValidationException | null =>
  validate(isFunction(value), 'isFunction');

/**
 * Assert that the value is a function.
 * See: https://developer.mozilla.org/en-US/docs/Glossary/Function
 *
 * @example
 * ```ts
 * assertFunction(() => 'a') // void
 * assertFunction(1) // throws AssertionException
 * ```
 *
 * @param value the value to check
 * @throws an `AssertionException` if the value is not the expected type
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export const assertFunction = (value: unknown): asserts value is Function =>
  assert(isFunction(value), 'isFunction');
