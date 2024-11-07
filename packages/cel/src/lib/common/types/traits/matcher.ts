/* eslint-disable @typescript-eslint/no-explicit-any */
import { isFunction } from '@bearclaw/is';
import { Value } from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb';
import { RefVal } from '../../ref/reference';
import { matchStringValue } from '../string';

export function matcher(value: Value, other: Value) {
  switch (value.kind.case) {
    case 'stringValue':
      return matchStringValue(value, other);
    default:
      return new Error('no such overload');
  }
}

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
