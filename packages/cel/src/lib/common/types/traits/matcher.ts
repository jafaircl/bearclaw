/* eslint-disable @typescript-eslint/no-explicit-any */
import { isFunction } from '@bearclaw/is';
import { RefVal } from '../../ref/reference';

/**
 * Matcher interface for supporting 'matches()' overloads.
 */
export interface Matcher {
  /**
   * Match returns true if the pattern matches the current value.
   */
  match(pattern: RefVal): RefVal;
}

export function isMatcher(value: any): value is Matcher {
  return value && isFunction(value.match);
}
