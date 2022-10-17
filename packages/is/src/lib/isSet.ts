import { assert } from './assert';
import { validate } from './validate';
import { ValidationException } from './ValidationException';

/**
 * Is the value a Set?
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
 *
 * @example
 * ```ts
 * isSet(new Set()) // true
 * isSet(1) // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
export const isSet = <T>(value: unknown | Set<T>): value is Set<T> => {
  return Object.prototype.toString.call(value) === '[object Set]';
};

/**
 * Validate that the value is a Set.
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
 *
 * @example
 * ```ts
 * validateSet(new Set()) // null
 * validateSet(1) // ValidationException
 * ```
 *
 * @param value the value to check
 * @returns `null` the value is the expected type or a `ValidationException` if
 * not
 */
export const validateSet = (value: unknown): ValidationException | null =>
  validate(isSet(value), 'isSet');

/**
 * Assert that the value is a Set.
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
 *
 * @example
 * ```ts
 * assertSet(new Set()) // void
 * assertSet(1) // throws AssertionException
 * ```
 *
 * @param value the value to check
 * @throws an `AssertionException` if the value is not the expected type
 */
export const assertSet = <T>(
  value: unknown | Set<T>
): asserts value is Set<T> => assert(isSet(value), 'isSet');
