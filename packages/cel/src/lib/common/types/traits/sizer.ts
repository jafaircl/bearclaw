/* eslint-disable @typescript-eslint/no-explicit-any */
import { isFunction } from '@bearclaw/is';
import { Value } from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb.js';
import { RefVal } from '../../ref/reference';
import { sizeBytesValue } from '../bytes';
import { sizeStringValue } from '../string';

export function sizer(value: Value) {
  switch (value.kind.case) {
    case 'bytesValue':
      return sizeBytesValue(value);
    case 'stringValue':
      return sizeStringValue(value);
    default:
      return new Error('no such overload');
  }
}

/**
 * Sizer interface for supporting 'size()' overloads.
 */
export interface Sizer {
  /**
   * Size returns the number of elements or length of the value.
   */
  size(): RefVal;
}

export function isSizer(value: any): value is Sizer {
  return value && isFunction(value.size);
}
