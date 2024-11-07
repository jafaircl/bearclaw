/* eslint-disable @typescript-eslint/no-explicit-any */
import { isFunction, isNil } from '@bearclaw/is';
import { Value } from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb.js';
import { boolValue, isZeroBoolValue } from '../bool';
import { isZeroDoubleValue } from '../double';
import { isZeroInt64Value } from '../int';
import { isZeroStringValue } from '../string';
import { isZeroUint64Value } from '../uint';

export function isZeroValue(value: Value | null | undefined) {
  if (isNil(value)) {
    return boolValue(true);
  }
  switch (value.kind.value) {
    case 'boolValue':
      return isZeroBoolValue(value);
    case 'bytesValue':
      return isZeroBoolValue(value);
    case 'doubleValue':
      return isZeroDoubleValue(value);
    case 'int64Value':
      return isZeroInt64Value(value);
    case 'stringValue':
      return isZeroStringValue(value);
    case 'uint64Value':
      return isZeroUint64Value(value);
    default:
      return new Error('no such overload');
  }
}

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
