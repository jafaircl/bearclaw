import { isNil } from './isNil';

/**
 * Is the value bindable? Arrow functions, constructors and functions that are
 * already bound will not be bindable.
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_objects/Function/bind
 *
 * @example
 * ```ts
 * isBindable(function () {}) // true
 * isBindable(function () { return 'a'; }.bind(this)) // false
 * isBindable(() => 'a') // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export const isBindable = (value: unknown): value is Function => {
  // eslint-disable-next-line no-prototype-builtins
  return !isNil(value) && value.hasOwnProperty('prototype');
};
