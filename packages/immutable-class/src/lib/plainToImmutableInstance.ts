import {
  ClassConstructor,
  ClassTransformOptions,
  plainToInstance,
} from 'class-transformer';
import deepFreeze from 'deep-freeze-strict';

/**
 * Converts a plain (literal) object to an immutable class (constructor) object.
 * Also works with arrays.
 *
 * @example
 * ```ts
 * class MyClass {
 *   foo!: string
 * }
 * const plain = { foo: 'example' };
 * plain.foo = 'bar'; // No errors
 * const instance = plainToImmutableInstance(MyClass, plain);
 * instance.foo = 'foo'; // throws a read only property error
 * ```
 *
 * @param cls the class (constructor) object to convert to
 * @param plain the plain (literal) object to convert
 * @param options options to be passed during transformation
 * @returns an immutable class (constructor) object or array of immutable class
 * (constructor) objects
 */
export function plainToImmutableInstance<T, V>(
  cls: ClassConstructor<T>,
  plain: V[],
  options?: ClassTransformOptions
): T[];
export function plainToImmutableInstance<T, V>(
  cls: ClassConstructor<T>,
  plain: V,
  options?: ClassTransformOptions
): T;
export function plainToImmutableInstance<T, V>(
  cls: ClassConstructor<T>,
  plain: V | V[],
  options?: ClassTransformOptions
): T | T[] {
  const instanceOrArrayOfInstances = plainToInstance(cls, plain, options);
  if (Array.isArray(instanceOrArrayOfInstances)) {
    return instanceOrArrayOfInstances.map((obj) => deepFreeze(obj));
  }
  return deepFreeze(instanceOrArrayOfInstances);
}
