import { ValidationException } from './ValidationException';

/**
 * Check that some assertion is true and return a `ValidationException` (or some
 * provided custom error) if it is not.
 *
 * @example
 * ```ts
 * function validateIsNotNil(value: unknown) {
 *   return validate(!isNil(value), 'isNotNil')
 * }
 * validateIsNotNil({}) // null
 * validateIsNotNil(null) // returns ValidationException
 * ```
 *
 * @param value the result of some assertion
 * @param errorOrMessage a message to pass to a `ValidationException` or a
 * custom error instance if the assertion is false
 * @returns a `ValidationException` or the provided error instance if the
 * assertion is false
 */
export const validate = <
  V extends boolean = boolean,
  E extends Error = ValidationException
>(
  value: V,
  errorOrMessage: string | E
): E | null => {
  if (value === true) {
    return null;
  }
  if (typeof errorOrMessage === 'string') {
    return new ValidationException(errorOrMessage) as E;
  } else {
    return errorOrMessage;
  }
};
