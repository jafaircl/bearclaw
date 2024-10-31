/* eslint-disable @typescript-eslint/no-explicit-any */
import { Value } from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb.js';

/**
 * TypeAdapter converts native Go values of varying type and complexity to
 * equivalent CEL values.
 */
export interface TypeAdapter {
  /**
   * NativeToValue converts the input `value` to a CEL `Value`.
   */
  nativeToValue(value: any): Value;
}
