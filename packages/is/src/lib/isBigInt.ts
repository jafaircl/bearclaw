import { assert } from './assert';
import { isType } from './isType';
import { validate } from './validate';
import { ValidationException } from './ValidationException';

/**
 * Is the value a BigInt?
 * See: https://developer.mozilla.org/en-US/docs/Glossary/BigInt
 *
 * @example
 * ```ts
 * isBigInt(BigInt(1)) // true
 * isBigInt(1) // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
export const isBigInt = (value: unknown): value is bigint =>
  isType('BigInt', value);

/**
 * Validate that the value is a BigInt.
 * See: https://developer.mozilla.org/en-US/docs/Glossary/BigInt
 *
 * @example
 * ```ts
 * validateBigInt(BigInt(1)) // null
 * validateBigInt(1) // ValidationException
 * ```
 *
 * @param value the value to check
 * @returns `null` if the value is the expected type or a `ValidationException`
 * if not
 */
export const validateBigInt = (value: unknown): ValidationException | null =>
  validate(isBigInt(value), 'isBigInt');

/**
 * Assert that the value is a BigInt.
 * See: https://developer.mozilla.org/en-US/docs/Glossary/BigInt
 *
 * @example
 * ```ts
 * assertBigInt(BigInt(1)) // void
 * assertBigInt(1) // throws AssertionException
 * ```
 *
 * @param value the value to check
 * @throws an `AssertionException` if the value is not the expected type
 */
export const assertBigInt = (value: unknown): asserts value is bigint =>
  assert(isBigInt(value), 'isBigInt');
