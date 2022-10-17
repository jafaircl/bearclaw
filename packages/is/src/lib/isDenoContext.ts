import { assert } from './assert';
import { validate } from './validate';
import { ValidationException } from './ValidationException';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Deno: any;

/**
 * Is this function being invoked in a Deno context?
 * See: https://deno.land/
 *
 * @returns a boolean indicating whether we are currently in a Deno context
 */
export const isDenoContext = (): boolean => {
  return typeof Deno !== 'undefined' && typeof Deno.core !== 'undefined';
};

/**
 * Validate that this function is being invoked in a Deno context.
 * See: https://deno.land/
 *
 * @returns `null` we are in a Deno context or a `ValidationException` if not
 */
export const validateDenoContext = (): ValidationException | null =>
  validate(isDenoContext(), 'isDenoContext');

/**
 * Assert that this function is being invoked in a Deno context.
 * See: https://deno.land/
 *
 * @throws an `AssertionException` if the function is not invoked in a Deno
 * context
 */
export const assertDenoContext = (): void =>
  assert(isDenoContext(), 'isDenoContext');
