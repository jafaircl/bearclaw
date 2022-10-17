import { assert } from './assert';
import { isNil } from './isNil';
import { validate } from './validate';
import { ValidationException } from './ValidationException';

/**
 * Is the value a non-null Object?
 * See: https://developer.mozilla.org/en-US/docs/Glossary/Object
 *
 * @example
 * ```ts
 * isObject({}) // true
 * isObject(1) // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
export const isObject = <K extends string | number | symbol, V>(
  value: unknown | Record<K, V>
): value is Record<K, V> => {
  return !isNil(value) && typeof value === 'object';
};

/**
 * Validate that the value is a non-null Object.
 * See: https://developer.mozilla.org/en-US/docs/Glossary/Object
 *
 * @example
 * ```ts
 * validateObject({}) // null
 * validateObject(1) // ValidationException
 * ```
 *
 * @param value the value to check
 * @returns `null` the value is the expected type or a `ValidationException` if
 * not
 */
export const validateObject = (value: unknown): ValidationException | null =>
  validate(isObject(value), 'isObject');

/**
 * Assert that the value is a non-null Object.
 * See: https://developer.mozilla.org/en-US/docs/Glossary/Object
 *
 * @example
 * ```ts
 * assertObject({}) // void
 * assertObject(1) // throws AssertionException
 * ```
 *
 * @param value the value to check
 * @throws an `AssertionException` if the value is not the expected type
 */
export const assertObject = <K extends string | number | symbol, V>(
  value: unknown | Record<K, V>
): asserts value is Record<K, V> => assert(isObject(value), 'isObject');
