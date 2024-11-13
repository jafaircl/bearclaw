/* eslint-disable @typescript-eslint/no-explicit-any */
import { RefVal } from './reference';

/**
 * TypeAdapter converts native Go values of varying type and complexity to
 * equivalent CEL values.
 */
export interface TypeAdapter {
  /**
   * NativeToValue converts the input `value` to a CEL `Value`.
   */
  nativeToValue(value: any): RefVal;
}
