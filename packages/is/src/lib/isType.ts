import { assert } from './assert';
import { getType } from './getType';
import { validate } from './validate';
import { ValidationException } from './ValidationException';

/**
 * Is the value the provided type? Uses `Object.prototype.toString` so it will
 * not work with custom classes unless `[Symbol.toStringTag]` is defined.
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures
 *
 * @example
 * ```ts
 * isType('Number', 1) // true
 * isType('String', 1) // false
 * ```
 *
 * @param type the type to check the value against
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
export const isType = (type: string, value: unknown): boolean =>
  getType(value) === type;

/**
 * Validate that the value is the provided type. Uses `Object.prototype
 * toString` so it will not work with custom classes unless
 * `[Symbol.toStringTag]` is defined.
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures
 *
 * @example
 * ```ts
 * validateType('Number', 1) // null
 * validateType('String', 1) // ValidationException
 * ```
 *
 * @param type the type to check the value against
 * @param value the value to check
 * @returns `null` if the value is the expected type or a `ValidationException`
 * if not
 */
export const validateType = (
  type: string,
  value: unknown
): ValidationException | null => validate(isType(type, value), 'isType');

/**
 * Assert that the value is the provided type. Uses `Object.prototype.toString`
 * so it will not work with custom classes unless `[Symbol.toStringTag]` is
 * defined.
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures
 *
 * @example
 * ```ts
 * assertType('Number', 1) // void
 * assertType('String', 1) // throws AssertionException
 * ```
 *
 * @param type the type to check the value against
 * @param value the value to check
 * @throws an `AssertionException` if the value is not the expected type
 */
export const assertType = (type: string, value: unknown): void =>
  assert(isType(type, value), 'isType');
