import { isFunction } from '..';
import { isBindable } from './isBindable';

/**
 * Is the value a bound function?
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_objects/Function/bind
 *
 * @example
 * ```ts
 * isBoundFunction(function () { return 'a'; }.bind(this)) // true
 * isBoundFunction(function () {}) // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export const isBoundFunction = (value: unknown): value is Function => {
  return isFunction(value) && !isBindable(value);
};
