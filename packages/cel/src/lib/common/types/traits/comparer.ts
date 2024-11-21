/* eslint-disable @typescript-eslint/no-explicit-any */
import { isFunction } from '@bearclaw/is';
import { RefVal } from '../../ref/reference';

/**
 * Comparer interface for ordering comparisons between values in order to
 * support '<', '<=', '>=', '>' overloads.
 */
export interface Comparer {
  /**
   * Compare this value to the input other value, returning an Int:
   *    this < other  -> Int(-1)
   *    this == other ->  Int(0)
   *    this > other  ->  Int(1)
   * If the comparison cannot be made or is not supported, an error should
   * be returned.
   */
  compare(other: RefVal): RefVal;
}

export function isComparer(value: any): value is Comparer {
  return value && isFunction(value.compare);
}
