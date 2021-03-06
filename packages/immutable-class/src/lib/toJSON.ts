import { classToPlain, ClassTransformOptions } from 'class-transformer';
import deepFreeze from 'deep-freeze-strict';

/**
 * Convert a class to an immutable plain object.
 *
 * @example
 * ```typescript
 * class Test {
 *   readonly foo!: string;
 *   readonly bar?: string
 * }
 *
 * const cls = new Test();
 * const emptyJson = toJSON(cls);
 * // emptyJson: {
 * //   foo: undefined,
 * //   bar: undefined,
 * // }
 * cls.foo = 'abc'
 * cls.bar = '123'
 * const setJson = toJSON(cls)
 * // setJson: {
 * //    foo: 'abc',
 * //    bar: '123',
 * // }
 * ```
 *
 * @param classToTransform the class you want to transform
 * @param options any class-transformer options to pass
 * @returns a JSON representation of the class instance
 */
export const toJSON = <
  ClassType,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  JSONType extends Record<string, any> = ClassType
>(
  classToTransform: ClassType,
  options?: ClassTransformOptions
): JSONType => {
  const cls = classToPlain(classToTransform, options);
  return deepFreeze(cls) as JSONType;
};
