import {
  ClassConstructor,
  ClassTransformOptions,
  plainToClass,
} from 'class-transformer';
import deepFreeze from 'deep-freeze-strict';

/**
 * Create an immutable class from a JSON object.
 *
 * @example
 * ```typescript
 * class Test {
 *   readonly foo!: string;
 *   readonly bar?: string
 * }
 *
 * const cls = fromJSON(Test, { foo: 'asdf' });
 * // cls: Test {
 * //   foo: 'asdf',
 * //   bar: undefined,
 * // }
 * ```
 *
 * @param classToCreate the class to create an instance of
 * @param json the JSON input
 * @param options any class-transformer options to pass
 * @returns an immutable class
 */
export const fromJSON = <ClassType>(
  classCtor: ClassConstructor<ClassType>,
  json: Partial<ClassType>,
  options?: ClassTransformOptions
): ClassType => {
  const cls = plainToClass(classCtor, json, options);
  return deepFreeze(cls);
};
