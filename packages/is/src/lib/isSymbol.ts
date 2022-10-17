import { assert } from './assert';
import { validate } from './validate';
import { ValidationException } from './ValidationException';

/**
 * Is the value a Symbol?
 * See: https://developer.mozilla.org/en-US/docs/Glossary/Symbol
 *
 * @example
 * ```ts
 * isSymbol(Symbol('')) // true
 * isSymbol('') // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
export const isSymbol = (value: unknown): value is symbol => {
  return Object.prototype.toString.call(value) === '[object Symbol]';
};

/**
 * Validate that the value is a Symbol.
 * See: https://developer.mozilla.org/en-US/docs/Glossary/Symbol
 *
 * @example
 * ```ts
 * validateSymbol(Symbol('')) // null
 * validateSymbol('') // ValidationException
 * ```
 *
 * @param value the value to check
 * @returns `null` the value is the expected type or a `ValidationException` if
 * not
 */
export const validateSymbol = (value: unknown): ValidationException | null =>
  validate(isSymbol(value), 'isSymbol');

/**
 * Assert that the value is a Symbol.
 * See: https://developer.mozilla.org/en-US/docs/Glossary/Symbol
 *
 * @example
 * ```ts
 * assertSymbol(Symbol('')) // void
 * assertSymbol('') // throws AssertionException
 * ```
 *
 * @param value the value to check
 * @throws an `AssertionException` if the value is not the expected type
 */
export const assertSymbol = (value: unknown): asserts value is symbol =>
  assert(isSymbol(value), 'isSymbol');
