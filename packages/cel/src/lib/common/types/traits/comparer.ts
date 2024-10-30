import { Value } from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb';
import { compareBoolValue } from '../bool';
import { compareDoubleValue } from '../double';
import { compareInt64Value } from '../int';

export function compare(value: Value, other: Value) {
  switch (value.kind.case) {
    case 'boolValue':
      return compareBoolValue(value, other);
    case 'doubleValue':
      return compareDoubleValue(value, other);
    case 'int64Value':
      return compareInt64Value(value, other);
    default:
      return new Error('no such overload');
  }
}
