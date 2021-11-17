import { isBoundFunction } from './isBoundFunction';

/**
 * Is the value an arrow function?
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions
 *
 * @example
 * ```ts
 * isArrowFunction(() => 'a') // true
 * isArrowFunction(function () {}) // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export const isArrowFunction = (value: unknown): value is Function => {
  return (
    isBoundFunction(value) &&
    /^([^{=]+|\(.*\)\s*)?=>/.test(value.toString().replace(/\s/, ''))
  );
};
