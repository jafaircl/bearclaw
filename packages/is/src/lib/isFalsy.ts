export type Falsy = false | 0 | -0 | 0n | '' | null | undefined | typeof NaN;

/**
 * Is the value falsy?
 * See: https://developer.mozilla.org/en-US/docs/Glossary/Falsy
 *
 * @example
 * ```ts
 * isFalsy(0) // true
 * isFalsy(1) // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
export const isFalsy = (value: unknown): value is Falsy => {
  if (!value) {
    return true;
  }
  return false;
};
