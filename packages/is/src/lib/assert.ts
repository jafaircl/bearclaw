import { AssertionException } from './AssertionException';

/**
 * Check that some assertion is true and throw an `AssertionException` (or some
 * provided custom error) if it is not.
 *
 * @example
 * ```ts
 * function assertIsNotNil(value: unknown) {
 *   return assert(!isNil(value), 'isNotNil')
 * }
 * assertIsNotNil({}) // void
 * assertIsNotNil(null) // throws AssertionException
 * ```
 *
 * @param value the result of some assertion
 * @param errorOrMessage a message to pass to an `AssertionException` or the
 * error to throw if the assertion is false
 * @throws an `AssertionException` (or the provided error instance) if the
 * assertion is false
 */
export function assert<V extends boolean = boolean, E extends Error = Error>(
  value: V,
  errorOrMessage: string | E
): asserts value {
  if (value === true) {
    return;
  }
  if (typeof errorOrMessage === 'string') {
    throw new AssertionException(errorOrMessage);
  } else {
    throw errorOrMessage;
  }
}
