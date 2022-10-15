import { isNull } from './isNull';
import { isUndefined } from './isUndefined';

/**
 * Is the value null or undefined?
 *
 * @example
 * ```ts
 * isNil(null) // true
 * isNil(undefined) // true
 * isNil(1) // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
export const isNil = (value: unknown): value is null | undefined => {
  return isNull(value) || isUndefined(value);
};
