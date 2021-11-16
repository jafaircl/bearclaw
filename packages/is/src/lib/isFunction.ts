/**
 * Is the value a function?
 * See: https://developer.mozilla.org/en-US/docs/Glossary/Function
 *
 * @example
 * ```ts
 * isFunction(() => 'a') // true
 * isFunction(1) // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export const isFunction = (value: unknown): value is Function => {
  return Object.prototype.toString.call(value) === '[object Function]';
};
