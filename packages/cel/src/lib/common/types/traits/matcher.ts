import { Value } from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb';
import { matchStringValue } from '../string';

export function matcher(value: Value, other: Value) {
  switch (value.kind.case) {
    case 'stringValue':
      return matchStringValue(value, other);
    default:
      return new Error('no such overload');
  }
}
