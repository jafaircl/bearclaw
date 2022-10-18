import { assert } from './assert';
import { isSet } from './isSet';
import { validate } from './validate';
import { ValidationException } from './ValidationException';

/**
 * Is the value a Set with no values?
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
 *
 * @example
 * ```ts
 * isEmptySet(new Set()) // true
 * isEmptySet(new Set([1])) // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
export const isEmptySet = <T>(value: unknown | Set<T>): value is Set<T> => {
  return isSet(value) && value.size === 0;
};

/**
 * Validate that the value is a Set with no values.
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
 *
 * @example
 * ```ts
 * validateEmptySet(new Set()) // null
 * validateEmptySet(new Set([1])) // ValidationException
 * ```
 *
 * @param value the value to check
 * @returns `null` if the value is the expected type or a `ValidationException`
 * if not
 */
export const validateEmptySet = (
  value: unknown
): ValidationException | null => {
  return validate(isEmptySet(value), 'isEmptySet');
};

/**
 * Assert that the value is a Set with no values.
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
 *
 * @example
 * ```ts
 * assertEmptySet(new Set()) // void
 * assertEmptySet(new Set([1])) // throws AssertionException
 * ```
 *
 * @param value the value to check
 * @throws an `AssertionException` if the value is not the expected type
 */
export const assertEmptySet = <T>(
  value: unknown | Set<T>
): asserts value is Set<T> => assert(isEmptySet(value), 'isEmptySet');
