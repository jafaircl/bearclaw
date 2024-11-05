import { Value } from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb';
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
