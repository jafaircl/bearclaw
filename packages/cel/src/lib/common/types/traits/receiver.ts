import { Value } from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb.js';
import { receiveStringValue } from '../string';

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
