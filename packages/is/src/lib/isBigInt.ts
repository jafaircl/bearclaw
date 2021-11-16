/**
 * Is the value a BigInt?
 * See: https://developer.mozilla.org/en-US/docs/Glossary/BigInt
 *
 * @example
 * ```ts
 * isBigInt(BigInt(1)) // true
 * isBigInt(1) // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
export const isBigInt = (value: unknown): value is bigint => {
  return Object.prototype.toString.call(value) === '[object BigInt]';
};
