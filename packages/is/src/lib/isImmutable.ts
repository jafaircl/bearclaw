import { assert } from './assert';
import { isPrimitive } from './isPrimitive';
import { validate } from './validate';
import { ValidationException } from './ValidationException';

/**
 * Is the value immutable?
 * See: https://developer.mozilla.org/en-US/docs/Glossary/Mutable
 *
 * ```ts
 * isImmutable(Object.freeze({})) // true
 * isImmutable({}) // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
export const isImmutable = (value: unknown): boolean => {
  if (isPrimitive(value)) {
    return true;
  }
  return Object.isFrozen(value);
};

/**
 * Validate that the value is immutable.
 * See: https://developer.mozilla.org/en-US/docs/Glossary/Mutable
 *
 * ```ts
 * validateImmutable(Object.freeze({})) // null
 * validateImmutable({}) // ValidationException
 * ```
 *
 * @param value the value to check
 * @returns `null` the value is the expected type or a `ValidationException` if
 * not
 */
export const validateImmutable = (value: unknown): ValidationException | null =>
  validate(isImmutable(value), 'isImmutable');

/**
 * Assert that the value is immutable.
 * See: https://developer.mozilla.org/en-US/docs/Glossary/Mutable
 *
 * ```ts
 * assertImmutable(Object.freeze({})) // void
 * assertImmutable({}) // throws AssertionException
 * ```
 *
 * @param value the value to check
 * @throws an `AssertionException` if the value is not the expected type
 */
export const assertImmutable = (value: unknown): void =>
  assert(isImmutable(value), 'isImmutable');
