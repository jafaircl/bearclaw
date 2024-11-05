import { Value } from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb.js';
import { negateBoolValue } from '../bool';
import { negateDoubleValue } from '../double';
import { negateInt64Value } from '../int';

export function negater(value: Value) {
  switch (value.kind.case) {
    case 'boolValue':
      return negateBoolValue(value);
    case 'doubleValue':
      return negateDoubleValue(value);
    case 'int64Value':
      return negateInt64Value(value);
    default:
      return new Error('no such overload');
  }
}
