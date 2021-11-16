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
