import {
  ClassTransformOptions,
  plainToClassFromExist,
} from 'class-transformer';
import { update } from './update';

/**
 * Patch an immutable class with a JSON value. This function will leave the
 * original class unmodified and return an updated copy of the class. Note that
 * classes must be marked with "[immerable]: true" in order to use this
 * function.
 *
 * @example
 * ```typescript
 * class Test {
 *   [immerable] = true;
 *   readonly foo!: string;
 *   readonly bar?: string
 * }
 * const cls = create(Test)
 * const patched = patch(cls, { foo: 'abc' })
 * // patched: Test {
 * //   foo: 'abc',
 * //   bar: undefined
 * // }
 * ```
 *
 * @param classToUpdate the existing class instance to update
 * @param json the JSON input
 * @returns an updated immutable class instance
 */
export const patch = <ClassType>(
  classToUpdate: ClassType,
  json: Partial<ClassType>,
  options?: ClassTransformOptions
): ClassType => {
  return update(classToUpdate, (draft) =>
    plainToClassFromExist(draft, json, options)
  );
};
