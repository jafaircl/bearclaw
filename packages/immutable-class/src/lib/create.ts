import { ClassConstructor, ClassTransformOptions } from 'class-transformer';
import { fromJSON } from './fromJSON';

/**
 * Create an immutable instance of a class. Note that any fields that do not
 * have the class-transformer `@Expose` decorator will be ignored by the
 * function. The decorator is also exported from this library for convenience.
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
 * const cls = create(Test);
 * // cls: Test {
 * //   foo: undefined,
 * //   bar: undefined,
 * // }
 * ```
 *
 * @param classToCreate the class to create an instance of
 * @param options any additional class-transformer options to pass
 * @returns an immutable class
 */
export const create = <ClassType>(
  classToCreate: ClassConstructor<ClassType>,
  options?: ClassTransformOptions
): ClassType => {
  return fromJSON(classToCreate, {}, options);
};
