import { assert } from './assert';
import { isArray } from './isArray';
import { isBoolean } from './isBoolean';
import { isNull } from './isNull';
import { isNumber } from './isNumber';
import { isPlainObject } from './isPlainObject';
import { isString } from './isString';
import { validate } from './validate';
import { ValidationException } from './ValidationException';

export type JSONType =
  | string
  | number
  | boolean
  | null
  | JSONType[]
  | { [key: string | number]: JSONType };

/**
 * Is the value a valid JSON value?
 * See: https://www.ecma-international.org/publications-and-standards/standards/ecma-404/
 *
 * @example
 * ```ts
 * isJSON({ 'foo': 'bar' }) // true
 * isJSON(new Map()) // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
export const isJSON = (value: unknown): value is JSONType => {
  if (isString(value) || isBoolean(value) || isNull(value)) {
    return true;
  }
  if (isNumber(value) && isFinite(value)) {
    return true;
  }
  if (isArray(value)) {
    return value.every((v) => isJSON(v));
  }
  if (isPlainObject(value)) {
    return Object.entries(value).every(([k, v]) => isString(k) && isJSON(v));
  }
  return false;
};

/**
 * Validate that the value is a valid JSON value.
 * See: https://www.ecma-international.org/publications-and-standards/standards/ecma-404/
 *
 * @example
 * ```ts
 * validateJSON({ 'foo': 'bar' }) // null
 * validateJSON(new Map()) // ValidationException
 * ```
 *
 * @param value the value to check
 * @returns `null` if the value is the expected type or a `ValidationException`
 * if not
 */
export const validateJSON = (value: unknown): ValidationException | null =>
  validate(isJSON(value), 'isJSON');

/**
 * Assert that the value is a valid JSON value.
 * See: https://www.ecma-international.org/publications-and-standards/standards/ecma-404/
 *
 * @example
 * ```ts
 * assertJSON({ 'foo': 'bar' }) // void
 * assertJSON(new Map()) // throws AssertionException
 * ```
 *
 * @param value the value to check
 * @throws an `AssertionException` if the value is not the expected type
 */
export const assertJSON = (value: unknown): asserts value is JSONType =>
  assert(isJSON(value), 'isJSON');
