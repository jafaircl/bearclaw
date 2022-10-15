import { isNil } from './isNil';

/**
 * Is the value a non-null Object?
 * See: https://developer.mozilla.org/en-US/docs/Glossary/Object
 *
 * @example
 * ```ts
 * isObject({}) // true
 * isObject(1) // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
export const isObject = <K extends string | number | symbol, V>(
  value: unknown | Record<K, V>
): value is Record<K, V> => {
  return !isNil(value) && typeof value === 'object';
};
