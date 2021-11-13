import { classToClass, ClassTransformOptions } from 'class-transformer';
import deepFreeze from 'deep-freeze-strict';

/**
 * Clone an existing immutable class.
 *
 * @example
 * ```typescript
 * class Test {
 *   readonly foo!: string;
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
  classCtor: ClassType,
  options?: ClassTransformOptions
): ClassType => {
  const cls = classToClass(classCtor, options);
  return deepFreeze(cls);
};
