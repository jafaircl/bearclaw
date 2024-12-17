/* eslint-disable @typescript-eslint/no-explicit-any */
import { isFunction } from '@bearclaw/is';
import { RefVal } from '../../ref/reference';

/**
 * FieldTester indicates if a defined field on an object type is set to a
 * non-default value.
 *
 * For use with the `has()` macro.
 */
export interface FieldTester {
  /**
   * IsSet returns true if the field is defined and set to a non-default
   * value. The method will return false if defined and not set, and an error
   * if the field is not defined.
   */
  isSet(field: RefVal): RefVal;
}

export function isFieldTester(value: any): value is FieldTester {
  return value && isFunction(value.isSet);
}
