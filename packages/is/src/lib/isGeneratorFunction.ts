import { assert } from './assert';
import { validate } from './validate';
import { ValidationException } from './ValidationException';

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

/**
 * Validate that the value is a generator function.
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/GeneratorFunction
 *
 * @example
 * ```ts
 * validateGeneratorFunction(function* () { yield 'a' }) // null
 * validateGeneratorFunction(() => 'a') // ValidationException
 * ```
 *
 * @param value the value to check
 * @returns `null` the value is the expected type or a `ValidationException` if
 * not
 */
export const validateGeneratorFunction = (
  value: unknown
): ValidationException | null =>
  validate(isGeneratorFunction(value), 'isGeneratorFunction');

/**
 * Assert that the value is a generator function.
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/GeneratorFunction
 *
 * @example
 * ```ts
 * assertGeneratorFunction(function* () { yield 'a' }) // void
 * assertGeneratorFunction(() => 'a') // throws AssertionException
 * ```
 *
 * @param value the value to check
 * @throws an `AssertionException` if the value is not the expected type
 */
export const assertGeneratorFunction = (
  value: unknown
  // eslint-disable-next-line @typescript-eslint/ban-types
): asserts value is Function =>
  assert(isGeneratorFunction(value), 'isGeneratorFunction');
