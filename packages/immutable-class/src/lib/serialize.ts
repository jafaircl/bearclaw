import {
  ClassTransformOptions,
  serialize as _serialize,
} from 'class-transformer';

/**
 * Convert a class to an immutable plain object. Note that any fields that do
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
 * const cls = new Test();
 * const emptyJson = toJSON(cls);
 * // emptyJson: "{}""
 * cls.foo = 'abc'
 * cls.bar = '123'
 * const setJson = toJSON(cls)
 * // setJson: '{"foo":"abc","bar":"123"}'
 * ```
 *
 * @param classToTransform the class you want to transform
 * @param options any additional class-transformer options to pass
 * @returns a JSON string representation of the class instance
 */
export const serialize = <ClassType>(
  classToTransform: ClassType,
  options?: ClassTransformOptions
): string => {
  const cls = _serialize(classToTransform, {
    excludeExtraneousValues: true,
    exposeUnsetFields: true,
    exposeDefaultValues: true,
    ...options,
  });
  return cls;
};
