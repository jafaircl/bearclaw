import { ClassTransformOptions } from 'class-transformer';
import { Draft } from 'immer';
import extend from 'just-extend';
import { produceImmutableInstance } from './produceImmutableInstance';

/**
 * Produce the next immutable class (constructor) object by patching the
 * existing class (constructor) object. Also works with arrays.
 *
 * @example
 * ```ts
 * class MyClass {
 *   foo!: string
 * }
 * const instance = new MyClass();
 * instance.foo = 'bar'; // No errors
 * const updated = patchImmutableInstance(instance, { foo: 'some value' });
 * instance.foo = 'foo'; // throws a read only property error
 * ```
 *
 * @param object the class (constructor) object to update
 * @param patch a partial plain (literal) object to patch
 * @param options options to be passed during transformation. In addition to
 * the class-transformer options, a "deep" option can be passed which tells the
 * patching function whether to use a shallow or deep update (the default is true)
 */
export function patchImmutableInstance<T>(
  object: T[],
  patch: Partial<T>,
  options?: ClassTransformOptions & { deep?: boolean }
): T[];
export function patchImmutableInstance<T>(
  object: T,
  patch: Partial<T>,
  options?: ClassTransformOptions & { deep?: boolean }
): T;
export function patchImmutableInstance<T>(
  object: T | T[],
  patch: Partial<T>,
  options?: ClassTransformOptions & { deep?: boolean }
): T | T[] {
  return produceImmutableInstance(
    object,
    (draft) =>
      extend(
        options?.deep ?? true,
        draft as Draft<Record<string, unknown>>,
        patch
      ) as Draft<T>,
    options
  );
}
