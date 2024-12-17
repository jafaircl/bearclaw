/* eslint-disable @typescript-eslint/no-explicit-any */
import { isFunction } from '@bearclaw/is';

/**
 * Zeroer interface for testing whether a CEL value is a zero value for its
 * type.
 */
export interface Zeroer {
  /**
   * IsZeroValue indicates whether the object is the zero value for the type.
   */
  isZeroValue(): boolean;
}

export function isZeroer(value: any): value is Zeroer {
  return value && isFunction(value.isZeroValue);
}
