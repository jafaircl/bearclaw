/**
 * Is the value a promise?
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
 *
 * @example
 * ```ts
 * isPromise(Promise.resolve(a)) // true
 * isPromise(() => 'a') // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
export const isPromise = <T>(
  value: unknown | Promise<T>
): value is Promise<T> => {
  return Object.prototype.toString.call(value) === '[object Promise]';
};
