import { isUndefined } from '..';
import { isNull } from './isNull';

/**
 * Is the value null or undefined?
 *
 * @example
 * ```ts
 * isNullOrUndefined(null) // true
 * isNullOrUndefined(undefined) // true
 * isNullOrUndefined(1) // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
export const isNullOrUndefined = (
  value: unknown
): value is null | undefined => {
  return isNull(value) || isUndefined(value);
};
