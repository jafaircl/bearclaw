/* eslint-disable @typescript-eslint/no-explicit-any */
import { isFunction } from '@bearclaw/is';
import { Value } from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb';
import { RefVal } from '../../ref/reference';
import { compareBoolValue } from '../bool';
import { compareDoubleValue } from '../double';
import { compareInt64Value } from '../int';
import { compareStringValue } from '../string';
import { compareUint64Value } from '../uint';

export function comparer(value: Value, other: Value) {
  switch (value.kind.case) {
    case 'boolValue':
      return compareBoolValue(value, other);
    case 'doubleValue':
      return compareDoubleValue(value, other);
    case 'int64Value':
      return compareInt64Value(value, other);
    case 'stringValue':
      return compareStringValue(value, other);
    case 'uint64Value':
      return compareUint64Value(value, other);
    default:
      return new Error('no such overload');
  }
}

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
