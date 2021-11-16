/**
 * Is this function being invoked in a browser context?
 * See: https://developer.mozilla.org/en-US/docs/Glossary/Browser
 *
 * @returns a boolean indicating whether we are currently in a browser context
 */
export const isBrowserContext = (): boolean => {
  return typeof window === 'object' && typeof window.document !== 'undefined';
};
