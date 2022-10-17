import { assert } from './assert';
import { validate } from './validate';
import { ValidationException } from './ValidationException';

/**
 * Is this function being invoked in a Node.js context?
 * See: https://nodejs.org/
 *
 * @returns a boolean indicating whether we are currently in a node context
 */
export const isNodeContext = (): boolean => {
  return typeof process === 'object' && typeof require === 'function';
};

/**
 * Validate that this function is being invoked in a Node.js context.
 * See: https://nodejs.org/
 *
 * @returns `null` we are in a Node.js context or a `ValidationException` if not
 */
export const validateNodeContext = (): ValidationException | null =>
  validate(isNodeContext(), 'isNodeContext');

/**
 * Assert that this function is being invoked in a Node.js context.
 * See: https://nodejs.org/
 *
 * @throws an `AssertionException` if the function is not invoked in a Node.js
 * context
 */
export const assertNodeContext = (): void =>
  assert(isNodeContext(), 'isNodeContext');
