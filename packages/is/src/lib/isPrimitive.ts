import { assert } from './assert';
import { isBigInt } from './isBigInt';
import { isBoolean } from './isBoolean';
import { isNull } from './isNull';
import { isNumber } from './isNumber';
import { isString } from './isString';
import { isSymbol } from './isSymbol';
import { isUndefined } from './isUndefined';
import { validate } from './validate';
import { ValidationException } from './ValidationException';

export type Primitive =
  | string
  | number
  | bigint
  | boolean
  | undefined
  | symbol
  | null;

/**
 * Is the value any of the primitive types?
 * See: https://developer.mozilla.org/en-US/docs/Glossary/Primitive
 *
 * @example
 * ```ts
 * isPrimitive(1) // true
 * isPrimitive({}) // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
export const isPrimitive = (value: unknown): value is Primitive => {
  return (
    isString(value) ||
    isNumber(value) ||
    isBigInt(value) ||
    isBoolean(value) ||
    isUndefined(value) ||
    isSymbol(value) ||
    isNull(value)
  );
};

/**
 * Validate that the value is any of the primitive types.
 * See: https://developer.mozilla.org/en-US/docs/Glossary/Primitive
 *
 * @example
 * ```ts
 * validatePrimitive(1) // null
 * validatePrimitive({}) // ValidationException
 * ```
 *
 * @param value the value to check
 * @returns `null` if the value is the expected type or a `ValidationException`
 * if not
 */
export const validatePrimitive = (value: unknown): ValidationException | null =>
  validate(isPrimitive(value), 'isPrimitive');

/**
 * Assert that the value is any of the primitive types.
 * See: https://developer.mozilla.org/en-US/docs/Glossary/Primitive
 *
 * @example
 * ```ts
 * assertPrimitive(1) // void
 * assertPrimitive({}) // throws AssertionException
 * ```
 *
 * @param value the value to check
 * @throws an `AssertionException` if the value is not the expected type
 */
export const assertPrimitive = (value: unknown): asserts value is Primitive =>
  assert(isPrimitive(value), 'isPrimitive');
