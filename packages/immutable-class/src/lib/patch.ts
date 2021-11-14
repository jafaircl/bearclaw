import {
  ClassTransformOptions,
  plainToClassFromExist,
} from 'class-transformer';
import { update } from './update';

/**
 * Patch an immutable class with a JSON value. This function will leave the
 * original class unmodified and return an updated copy of the class. Note this
 * will add `[immerable]=true` to the returned class.
 *
 * @example
 * ```typescript
 * class Test {
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
 * @param options any class-transformer options to pass
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
