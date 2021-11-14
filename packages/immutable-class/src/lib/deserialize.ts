import {
  ClassConstructor,
  ClassTransformOptions,
  deserialize as _deserialize,
} from 'class-transformer';
import deepFreeze from 'deep-freeze-strict';

/**
 * Create an immutable instance of a class from a JSON string.
 *
 * @example
 * ```typescript
 * class Test {
 *   readonly foo!: string;
 *   readonly bar?: string
 * }
 *
 * const cls = deserialize(Test, `{ "foo": "asdf" }`);
 * // cls: Test {
 * //   foo: 'asdf',
 * //   bar: undefined,
 * // }
 * ```
 *
 * @param classToCreate the class to create an instance of
 * @param str the string input
 * @param options any class-transformer options to pass
 * @returns an immutable class
 */
export const deserialize = <ClassType>(
  classCtor: ClassConstructor<ClassType>,
  str: string,
  options?: ClassTransformOptions
): ClassType => {
  const cls = _deserialize(classCtor, str, options);
  return deepFreeze(cls);
};
