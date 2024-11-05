import { Value } from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb.js';
import { sizeBytesValue } from '../bytes';
import { sizeStringValue } from '../string';

export function sizer(value: Value) {
  switch (value.kind.case) {
    case 'bytesValue':
      return sizeBytesValue(value);
    case 'stringValue':
      return sizeStringValue(value);
    default:
      return new Error('no such overload');
  }
}
