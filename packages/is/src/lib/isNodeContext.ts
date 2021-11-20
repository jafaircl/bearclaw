/**
 * Is this function being invoked in a Node.js context?
 * See: https://nodejs.org/
 *
 * @returns a boolean indicating whether we are currently in a node context
 */
export const isNodeContext = (): boolean => {
  return typeof process === 'object' && typeof require === 'function';
};
