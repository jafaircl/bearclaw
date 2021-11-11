import { classToClass, ClassTransformOptions } from 'class-transformer';
import deepFreeze from 'deep-freeze-strict';

/**
 * Clone an existing immutable class. Note that any fields that do not have the
 * class-transformer `@Expose` decorator will be ignored by the function.
 *
 * @example
 * ```typescript
 * class Test {
 *   \@Expose()
 *   readonly foo!: string;
 *   \@Expose()
 *   readonly bar?: string
 * }
 *
 * const cls = new Test();
 * cls.foo = 'test'
 * const copy = clone(cls)
 * // copy: Test {
 * //   foo: 'test',
 * //   bar: undefined
 * // }
 * ```
 *
 * @param classToClone the class to clone
 * @param options any additional class-transformer options to pass
 * @returns an immutable copy of the class to clone
 */
export const clone = <ClassType>(
  classToClone: ClassType,
  options?: ClassTransformOptions
): ClassType => {
  const cls = classToClass(classToClone, {
    excludeExtraneousValues: true,
    exposeUnsetFields: true,
    exposeDefaultValues: true,
    ...options,
  });
  return deepFreeze(cls);
};
