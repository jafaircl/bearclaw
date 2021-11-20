import { isArray } from './isArray';
import { isBoolean } from './isBoolean';
import { isNull } from './isNull';
import { isNumber } from './isNumber';
import { isPlainObject } from './isPlainObject';
import { isString } from './isString';

export type JSONType =
  | string
  | number
  | boolean
  | null
  | JSONType[]
  | { [key: string]: JSONType };

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
