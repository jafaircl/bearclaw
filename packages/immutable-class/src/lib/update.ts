import { classToClass, ClassTransformOptions } from 'class-transformer';
import deepFreeze from 'deep-freeze-strict';
import produce, { Draft, immerable } from 'immer';

export type ValidRecipeReturnType<State> = State | void | undefined;

/**
 * Update an immutable class. This function will leave the original class
 * unmodified and return an updated copy of the class. Note this will add
 * `[immerable]=true` to the returned class.
 *
 * @example
 * ```typescript
 * class Test {
 *   readonly foo!: string;
 *   readonly bar?: string
 * }
 * const cls = create(Test)
 * const updated = update(cls, x => {
 *   x.foo = 'abc'
 * })
 * // updated: Test {
 * //   foo: 'abc',
 * //   bar: undefined
 * // }
 * ```
 *
 * @param classToUpdate the existing class instance to update
 * @param recipe a recipe function used to make the desired updates to the
 * existing class instance
 * @param options any class-transformer options to pass
 * @returns an updated immutable class instance
 */
export const update = <ClassType>(
  classToUpdate: ClassType,
  recipe: (draft: Draft<ClassType>) => ValidRecipeReturnType<Draft<ClassType>>,
  options?: ClassTransformOptions
): ClassType => {
  const _classToUpdate = classToClass(classToUpdate, options);
  if (!_classToUpdate[immerable]) {
    _classToUpdate[immerable] = true;
  }
  const cls = produce(_classToUpdate, recipe);
  return deepFreeze(cls);
};
