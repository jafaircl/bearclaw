import { ClassTransformOptions, instanceToInstance } from 'class-transformer';
import deepFreeze from 'deep-freeze-strict';

/**
 * Converts a class (constructor) object to a new immutable class (constructor)
 * object. Also works with arrays.
 *
 * @example
 * ```ts
 * class MyClass {
 *   foo!: string
 * }
 * const existing = new MyClass();
 * existing.foo = 'bar'; // No errors
 * const instance = instanceToImmutableInstance(existing);
 * instance.foo = 'foo'; // throws a read only property error
 * ```
 *
 * @param object the class (constructor) object to convert
 * @param options options to be passed during transformation
 * @returns a new immutable class (constructor) object or array of new immutable
 * class (constructor) objects
 */
export function instanceToImmutableInstance<T>(
  object: T[],
  options?: ClassTransformOptions
): T[];
export function instanceToImmutableInstance<T>(
  object: T,
  options?: ClassTransformOptions
): T;
export function instanceToImmutableInstance<T>(
  object: T | T[],
  options?: ClassTransformOptions
): T | T[] {
  const instanceOrArrayOfInstances = instanceToInstance(object, options);
  if (Array.isArray(instanceOrArrayOfInstances)) {
    return instanceOrArrayOfInstances.map((obj) => deepFreeze(obj));
  }
  return deepFreeze(instanceOrArrayOfInstances);
}
