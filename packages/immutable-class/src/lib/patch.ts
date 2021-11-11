import {
  ClassTransformOptions,
  plainToClassFromExist,
} from 'class-transformer';
import { update } from './update';

/**
 * Patch an immutable class with a JSON value. This function will leave the
 * original class unmodified and return an updated copy of the class. Note that
 * classes must be marked with "[immerable]: true" in order to use this
 * function. Like other functions, any fields that do not have the
 * class-transformer `@Expose` decorator will be ignored by the function.
 *
 * @example
 * ```typescript
 * class Test {
 *   [immerable] = true;
 *   \@Expose()
 *   readonly foo!: string;
 *   \@Expose()
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
    plainToClassFromExist(draft, json, {
      excludeExtraneousValues: true,
      exposeUnsetFields: true,
      exposeDefaultValues: true,
      ...options,
    })
  );
};
