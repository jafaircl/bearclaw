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
