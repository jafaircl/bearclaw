/**
 * Is the value an async function?
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncFunction
 *
 * @example
 * ```ts
 * isAsyncFunction(async () => 'a') // true
 * isAsyncFunction(() => 'a') // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export const isAsyncFunction = (value: unknown): value is Function => {
  return value?.constructor?.name === 'AsyncFunction';
};
