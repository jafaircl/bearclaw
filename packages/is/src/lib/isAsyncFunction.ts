import { assert } from './assert';
import { validate } from './validate';
import { ValidationException } from './ValidationException';

/**
 * Is the value an async function?
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncFunction
 *
 * @example
 * ```ts
 * isAsyncFunction(async () => 'a') // true
 * isAsyncFunction(() => 'a') // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export const isAsyncFunction = (value: unknown): value is Function => {
  return value?.constructor?.name === 'AsyncFunction';
};

/**
 * Validate that the value is an async function.
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncFunction
 *
 * @example
 * ```ts
 * validateAsyncFunction(async () => 'a') // null
 * validateAsyncFunction(() => 'a') // ValidationException
 * ```
 *
 * @param value the value to check
 * @returns `null` the value is the expected type or a `ValidationException` if
 * not
 */
export const validateAsyncFunction = (
  value: unknown
): ValidationException | null =>
  validate(isAsyncFunction(value), 'isAsyncFunction');

/**
 * Assert that the value is an async function.
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncFunction
 *
 * @example
 * ```ts
 * assertAsyncFunction(async () => 'a') // void
 * assertAsyncFunction(() => 'a') // throws AssertionException
 * ```
 *
 * @param value the value to check
 * @throws an `AssertionException` if the value is not the expected type
 */
export const assertAsyncFunction = (
  value: unknown
  // eslint-disable-next-line @typescript-eslint/ban-types
): asserts value is Function =>
  assert(isAsyncFunction(value), 'isAsyncFunction');
