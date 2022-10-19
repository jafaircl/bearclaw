import { ClassTransformOptions, instanceToPlain } from 'class-transformer';
import deepFreeze from 'deep-freeze-strict';

/**
 * Converts a class (constructor) object to an immutable plain (literal) object.
 * Also works with arrays.
 *
 * @example
 * ```ts
 * class MyClass {
 *   foo!: string
 * }
 * const instance = new MyClass();
 * instance.foo = 'bar'; // No errors
 * const plain = instanceToImmutablePlain(instance);
 * plain.foo = 'foo'; // throws a read only property error
 * ```
 *
 * @param object the class (constructor) object to convert
 * @param options options to be passed during transformation
 * @returns an immutable plain (literal) object or array of immutable plain
 * (literal) objects
 */
export function instanceToImmutablePlain<T>(
  object: T[],
  options?: ClassTransformOptions
): Record<string, unknown>[];
export function instanceToImmutablePlain<T>(
  object: T,
  options?: ClassTransformOptions
): Record<string, unknown>;
export function instanceToImmutablePlain<T>(
  object: T | T[],
  options?: ClassTransformOptions
): Record<string, unknown> | Record<string, unknown>[] {
  const plainOrArrayOfPlains = instanceToPlain(object, options);
  if (Array.isArray(plainOrArrayOfPlains)) {
    return plainOrArrayOfPlains.map((obj) => deepFreeze(obj));
  }
  return deepFreeze(plainOrArrayOfPlains);
}
