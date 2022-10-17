import { assert } from './assert';
import { validate } from './validate';
import { ValidationException } from './ValidationException';

/**
 * Is this function being invoked in a browser context?
 * See: https://developer.mozilla.org/en-US/docs/Glossary/Browser
 *
 * @returns a boolean indicating whether we are currently in a browser context
 */
export const isBrowserContext = (): boolean => {
  return typeof window === 'object' && typeof window.document !== 'undefined';
};

/**
 * Validate that this function is being invoked in a browser context.
 * See: https://developer.mozilla.org/en-US/docs/Glossary/Browser
 *
 * @returns `null` we are in a browser context or a `ValidationException` if not
 */
export const validateBrowserContext = (): ValidationException | null =>
  validate(isBrowserContext(), 'isBrowserContext');

/**
 * Assert that this function is being invoked in a browser context.
 * See: https://developer.mozilla.org/en-US/docs/Glossary/Browser
 *
 * @throws an `AssertionException` if the function is not invoked in a browser
 * context
 */
export const assertBrowserContext = (): void =>
  assert(isBrowserContext(), 'isBrowserContext');
