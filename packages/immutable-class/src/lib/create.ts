import { ClassConstructor, ClassTransformOptions } from 'class-transformer';
import { fromJSON } from './fromJSON';

/**
 * Create an immutable instance of a class.
 *
 * @example
 * ```typescript
 * class Test {
 *   readonly foo!: string;
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
  classCtor: ClassConstructor<ClassType>,
  options?: ClassTransformOptions
): ClassType => {
  return fromJSON(classCtor, {}, options);
};
