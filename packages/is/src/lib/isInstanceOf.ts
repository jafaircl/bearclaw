import { assert } from './assert';
import { ClassConstructor } from './ClassConstructor';
import { isClassCtor } from './isClassCtor';
import { isType } from './isType';
import { validate } from './validate';
import { ValidationException } from './ValidationException';

/**
 * Is the value an instance of the provided constructor?
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/instanceof
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures
 *
 * @example
 * ```ts
 * isInstanceOf(Number, 1) // true
 * isInstanceOf(String, 1) // false
 * ```
 *
 * @param ctor the constructor to check the value against
 * @param value the value to check
 * @returns a boolean indicating whether the value is the expected type
 */
export const isInstanceOf = <T>(
  ctor: ClassConstructor<T>,
  value: unknown | T
): value is T => {
  if (isClassCtor(ctor) && value instanceof ctor) {
    return true;
  }
  return isType(ctor?.name, value);
};

/**
 * Validate that the value is an instance of the provided constructor.
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/instanceof
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures
 *
 * @example
 * ```ts
 * validateInstanceOf(Number, 1) // null
 * validateInstanceOf(String, 1) // ValidationException
 * ```
 *
 * @param ctor the constructor to check the value against
 * @param value the value to check
 * @returns `null` if the value is the expected type or a `ValidationException`
 * if not
 */
export const validateInstanceOf = <T>(
  ctor: ClassConstructor<T>,
  value: unknown | T
): ValidationException | null =>
  validate(isInstanceOf(ctor, value), 'isInstanceOf');

/**
 * Assert that the value is an instance of the provided constructor.
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/instanceof
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures
 *
 * @example
 * ```ts
 * assertInstanceOf(Number, 1) // void
 * assertInstanceOf(String, 1) // throws AssertionException
 * ```
 *
 * @param ctor the constructor to check the value against
 * @param value the value to check
 * @throws an `AssertionException` if the value is not the expected type
 */
export function assertInstanceOf<T>(
  ctor: ClassConstructor<T>,
  value: unknown | T
): asserts value is T {
  return assert(isInstanceOf(ctor, value), 'isInstanceOf');
}
