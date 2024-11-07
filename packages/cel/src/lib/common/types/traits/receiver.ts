/* eslint-disable @typescript-eslint/no-explicit-any */
import { isFunction } from '@bearclaw/is';
import { Value } from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb.js';
import { receiveStringValue } from '../string';
import { RefVal } from './../../ref/reference';

export function receiver(
  value: Value,
  fn: string,
  overload: string,
  ...args: Value[]
) {
  switch (value.kind.case) {
    case 'stringValue':
      return receiveStringValue(value, fn, overload, ...args);
    default:
      return new Error('no such overload');
  }
}

/**
 * Receiver interface for routing instance method calls within a value.
 */
export interface Receiver {
  /**
   * Receive accepts a function name, overload id, and arguments and returns a
   * value.
   */
  receive(fn: string, overload: string, args: RefVal[]): RefVal;
}

export function isReceiver(value: any): value is Receiver {
  return value && isFunction(value.receive);
}
