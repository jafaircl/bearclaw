import { Value } from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb.js';
import { equalBoolValue } from '../bool';
import { equalBytesValue } from '../bytes';
import { equalDoubleValue } from '../double';
import { equalInt64Value } from '../int';
import { equalStringValue } from '../string';
import { equalUint64Value } from '../uint';

export function equalValue(value: Value, other: Value) {
  switch (value.kind.case) {
    case 'boolValue':
      return equalBoolValue(value, other);
    case 'bytesValue':
      return equalBytesValue(value, other);
    case 'doubleValue':
      return equalDoubleValue(value, other);
    case 'int64Value':
      return equalInt64Value(value, other);
    case 'stringValue':
      return equalStringValue(value, other);
    case 'uint64Value':
      return equalUint64Value(value, other);
    default:
      return new Error('no such overload');
  }
}
