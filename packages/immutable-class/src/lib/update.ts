import deepFreeze from 'deep-freeze-strict';
import produce, { Draft } from 'immer';

export type ValidRecipeReturnType<State> = State | void | undefined;

/**
 * Update an immutable class. This function will leave the original class
 * unmodified and return an updated copy of the class. Note that classes must
 * be marked with `[immerable]: true` in order to use this function.
 *
 * @example
 * ```typescript
 * class Test {
 *   [immerable] = true;
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
 * @returns an updated immutable class instance
 */
export const update = <ClassType>(
  classToUpdate: ClassType,
  recipe: (draft: Draft<ClassType>) => ValidRecipeReturnType<Draft<ClassType>>
): ClassType => {
  const cls = produce(classToUpdate, recipe);
  return deepFreeze(cls);
};
