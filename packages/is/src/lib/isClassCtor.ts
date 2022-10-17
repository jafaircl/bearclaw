import { ClassConstructor } from 'class-transformer';
import { assert } from './assert';
import { isFunction } from './isFunction';
import { validate } from './validate';
import { ValidationException } from './ValidationException';

/**
 * Is the value a class constructor?
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
 *
 * @example
 * ```ts
 * isClassCtor(class Person {}) // true
 * isClassCtor(function () {}) // false
 * ```
 *
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
export const isClassCtor = <T>(
  value: unknown | ClassConstructor<T>
): value is ClassConstructor<T> => {
  return isFunction(value) && /^\s*class\s+/.test(value.toString());
};

/**
 * Validate that the value is a class constructor.
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
 *
 * @example
 * ```ts
 * validateClassCtor(class Person {}) // null
 * validateClassCtor(function () {}) // ValidationException
 * ```
 *
 * @param value the value to check
 * @returns `null` the value is the expected type or a `ValidationException` if
 * not
 */
export const validateClassCtor = (value: unknown): ValidationException | null =>
  validate(isClassCtor(value), 'isClassCtor');

/**
 * Assert that the value is a class constructor.
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
 *
 * @example
 * ```ts
 * assertClassCtor(class Person {}) // void
 * assertClassCtor(function () {}) // throws AssertionException
 * ```
 *
 * @param value the value to check
 * @throws an `AssertionException` if the value is not the expected type
 */
export const assertClassCtor = <T>(
  value: unknown | ClassConstructor<T>
): asserts value is ClassConstructor<T> =>
  assert(isClassCtor(value), 'isClassCtor');
