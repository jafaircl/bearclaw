import { isFalsy } from './isFalsy';

/**
 * Is the value truthy?
 * See: https://developer.mozilla.org/en-US/docs/Glossary/Truthy
 *
 * @example
 * ```ts
 * isTruthy(1) // true
 * isTruthy(0) // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
export const isTruthy = (value: unknown): boolean => {
  return !isFalsy(value);
};
