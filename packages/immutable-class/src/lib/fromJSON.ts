import {
  ClassConstructor,
  ClassTransformOptions,
  plainToClass,
} from 'class-transformer';
import deepFreeze from 'deep-freeze-strict';

/**
 * Create an immutable class from a JSON object. Note that any fields that do
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
 * const cls = fromJSON(Test, { foo: 'asdf' });
 * // cls: Test {
 * //   foo: 'asdf',
 * //   bar: undefined,
 * // }
 * ```
 *
 * @param classToCreate the class to create an instance of
 * @param json the JSON input
 * @param options any additional class-transformer options to pass
 * @returns an immutable class
 */
export const fromJSON = <ClassType>(
  classToCreate: ClassConstructor<ClassType>,
  json: Partial<ClassType>,
  options?: ClassTransformOptions
): ClassType => {
  const cls = plainToClass(classToCreate, json, {
    excludeExtraneousValues: true,
    exposeUnsetFields: true,
    exposeDefaultValues: true,
    ...options,
  });
  return deepFreeze(cls);
};
