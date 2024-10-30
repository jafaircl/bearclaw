import { Value } from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb.js';
import { isDoubleValue } from './double';
import { isInt64Value } from './int';
import { isUint64Value } from './uint';

export function isNumberValue(value: Value): value is Value & {
  kind:
    | { case: 'doubleValue'; value: number }
    | { case: 'int64Value'; value: bigint }
    | { case: 'uint64Value'; value: bigint };
} {
  return isDoubleValue(value) || isInt64Value(value) || isUint64Value(value);
}

export function unwrapNumberValue(value: Value): number | bigint | null {
  switch (value.kind.case) {
    case 'int64Value':
    case 'uint64Value':
    case 'doubleValue':
      return value.kind.value;
    default:
      return null;
  }
}
