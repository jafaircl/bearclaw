/**
 * Is the value a generator function?
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/GeneratorFunction
 *
 * @example
 * ```ts
 * isGeneratorFunction(function* () { yield 'a' }) // true
 * isGeneratorFunction(() => 'a') // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export const isGeneratorFunction = (value: unknown): value is Function => {
  return value?.constructor?.name === 'GeneratorFunction';
};
