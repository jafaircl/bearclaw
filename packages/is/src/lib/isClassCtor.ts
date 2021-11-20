import { isFunction } from './isFunction';

/**
 * Is the value a class constructor?
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
 *
 * @example
 * ```ts
 * isClassCtor(class Person {}) // true
 * isClassCtor(function () {}) // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
export const isClassCtor = (value: unknown): boolean => {
  return isFunction(value) && /^\s*class\s+/.test(value.toString());
};
