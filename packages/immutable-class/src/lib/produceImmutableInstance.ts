import { ClassTransformOptions, instanceToInstance } from 'class-transformer';
import deepFreeze from 'deep-freeze-strict';
import produce, { Draft, immerable } from 'immer';

type ValidRecipeReturnType<State> = State | void | undefined;

/**
 * Internal implentation
 */
function produceImmutableInstanceImpl<T>(
  object: T,
  recipe: (draft: Draft<T>) => ValidRecipeReturnType<Draft<T>>,
  options?: ClassTransformOptions
): T {
  const instance = instanceToInstance(object, options);
  if (!instance[immerable]) {
    instance[immerable] = true;
  }
  const nextInstance = produce(instance, recipe);
  return deepFreeze(nextInstance);
}

/**
 * Produce the next immutable class (constructor) object by modifying the
 * current class (constructor) object with a recipe function. Also works with
 * arrays.
 *
 * @example
 * ```ts
 * class MyClass {
 *   foo!: string
 * }
 * const instance = new MyClass();
 * instance.foo = 'bar'; // No errors
 * const updated = produceImmutableInstance(instance, draft => {
 *   draft.foo = 'some value'
 * });
 * instance.foo = 'foo'; // throws a read only property error
 * ```
 *
 * @param object the class (constructor) object to update
 * @param recipe a function that recieves a proxy of the class (constructor)
 * object which can be freely modified
 * @param options options to be passed during transformation
 * @returns a new immutable class (constructor) object or array of new immutable
 * class (constructor) objects
 */
export function produceImmutableInstance<T>(
  object: T[],
  recipe: (draft: Draft<T>) => ValidRecipeReturnType<Draft<T>>,
  options?: ClassTransformOptions
): T[];
export function produceImmutableInstance<T>(
  object: T,
  recipe: (draft: Draft<T>) => ValidRecipeReturnType<Draft<T>>,
  options?: ClassTransformOptions
): T;
export function produceImmutableInstance<T>(
  object: T | T[],
  recipe: (draft: Draft<T>) => ValidRecipeReturnType<Draft<T>>,
  options?: ClassTransformOptions
): T | T[] {
  if (Array.isArray(object)) {
    return object.map((obj) =>
      produceImmutableInstanceImpl(obj, recipe, options)
    );
  }
  return produceImmutableInstanceImpl(object, recipe, options);
}
