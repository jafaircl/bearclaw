import { isBigInt } from './isBigInt';
import { isBoolean } from './isBoolean';
import { isNull } from './isNull';
import { isNumber } from './isNumber';
import { isString } from './isString';
import { isSymbol } from './isSymbol';
import { isUndefined } from './isUndefined';

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
