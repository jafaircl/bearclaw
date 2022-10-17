import { assert } from './assert';
import { isPrimitive } from './isPrimitive';
import { validate } from './validate';
import { ValidationException } from './ValidationException';

/**
 * Is the value a structural type (object)?
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#objects
 *
 * @example
 * ```ts
 * isStructural({}) // true
 * isStructural(1) // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
export const isStructural = (value: unknown): boolean => {
  return !isPrimitive(value);
};

/**
 * Validate that the value is a structural type (object).
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#objects
 *
 * @example
 * ```ts
 * validateStructural({}) // null
 * validateStructural(1) // ValidationException
 * ```
 *
 * @param value the value to check
 * @returns `null` the value is the expected type or a `ValidationException` if
 * not
 */
export const validateStructural = (
  value: unknown
): ValidationException | null => validate(isStructural(value), 'isStructural');

/**
 * Assert that the value is a structural type (object).
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#objects
 *
 * @example
 * ```ts
 * assertStructural({}) // void
 * assertStructural(1) // throws AssertionException
 * ```
 *
 * @param value the value to check
 * @throws an `AssertionException` if the value is not the expected type
 */
export const assertStructural = (value: unknown): void =>
  assert(isStructural(value), 'isStructural');
