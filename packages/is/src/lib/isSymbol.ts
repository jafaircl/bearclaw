/**
 * Is the value a Symbol?
 * See: https://developer.mozilla.org/en-US/docs/Glossary/Symbol
 *
 * @example
 * ```ts
 * isSymbol('') // true
 * isSymbol(1) // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
export const isSymbol = (value: unknown): value is symbol => {
  return Object.prototype.toString.call(value) === '[object Symbol]';
};
