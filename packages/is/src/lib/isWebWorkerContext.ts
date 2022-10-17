import { assert } from './assert';
import { validate } from './validate';
import { ValidationException } from './ValidationException';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const importScripts: any;

/**
 * Is this function being invoked in a WebWorker context?
 * See: https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API
 *
 * @returns a boolean indicating whether we are currently in a WebWorker context
 */
export const isWebWorkerContext = (): boolean => {
  return typeof importScripts === 'function';
};

/**
 * Validate that this function is being invoked in a WebWorker context.
 * See: https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API
 *
 * @returns `null` we are in a Web Worker context or a `ValidationException` if
 * not
 */
export const validateWebWorkerContext = (): ValidationException | null =>
  validate(isWebWorkerContext(), 'isWebWorkerContext');

/**
 * Assert that this function is being invoked in a WebWorker context.
 * See: https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API
 *
 * @throws an `AssertionException` if the function is not invoked in a Web
 * Worker context
 */
export const assertWebWorkerContext = (): void =>
  assert(isWebWorkerContext(), 'isWebWorkerContext');
