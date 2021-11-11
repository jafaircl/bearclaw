import {
  ClassConstructor,
  ClassTransformOptions,
  deserialize as _deserialize,
} from 'class-transformer';
import deepFreeze from 'deep-freeze-strict';

/**
 * Create an immutable class from a JSON string. Note that any fields that do
 * not have the class-transformer `@Expose` decorator will be ignored by the
 * function.
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
 * const cls = deserialize(Test, `{ "foo": "asdf" }`);
 * // cls: Test {
 * //   foo: 'asdf',
 * //   bar: undefined,
 * // }
 * ```
 *
 * @param classToCreate the class to create an instance of
 * @param str the string input
 * @param options any additional class-transformer options to pass
 * @returns an immutable class
 */
export const deserialize = <ClassType>(
  classToCreate: ClassConstructor<ClassType>,
  str: string,
  options?: ClassTransformOptions
): ClassType => {
  const cls = _deserialize(classToCreate, str, {
    excludeExtraneousValues: true,
    exposeUnsetFields: true,
    exposeDefaultValues: true,
    ...options,
  });
  return deepFreeze(cls);
};
