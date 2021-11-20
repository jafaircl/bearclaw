import { isString } from './isString';

/**
 * Is the value a string with no characters?
 * See: https://developer.mozilla.org/en-US/docs/Glossary/String
 *
 * @example
 * ```ts
 * isEmptyString('') // true
 * isEmptyString('1') // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
export const isEmptyString = (value: unknown): value is string => {
  return isString(value) && value.length === 0;
};
