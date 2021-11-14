import {
  ClassConstructor,
  ClassTransformOptions,
  deserializeArray as _deserializeArray,
} from 'class-transformer';
import deepFreeze from 'deep-freeze-strict';

/**
 * Create an array of immutable classes from a JSON string.
 *
 * @example
 * ```typescript
 * class Test {
 *   readonly foo!: string;
 *   readonly bar?: string
 * }
 *
 * const classes = deserialize(Test, `[{ "foo": "asdf" }]`);
 * // classes: [Test {
 * //   foo: 'asdf',
 * //   bar: undefined,
 * // }]
 * ```
 *
 * @param classToCreate the class constructor
 * @param str the string input
 * @param options any class-transformer options to pass
 * @returns an array of immutable classes
 */
export const deserializeArray = <ClassType>(
  classCtor: ClassConstructor<ClassType>,
  str: string,
  options?: ClassTransformOptions
): ClassType[] => {
  const classes = _deserializeArray(classCtor, str, options);
  return classes.map((cls) => deepFreeze(cls));
};
