import { Type } from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb.js';
import { Value } from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb.js';
import { convertBoolValueToNative, convertBoolValueToType } from './bool';
import { convertBytesValueToNative, convertBytesValueToType } from './bytes';
import { convertDoubleValueToNative, convertDoubleValueToType } from './double';
import { convertInt64ValueToNative, convertInt64ValueToType } from './int';
import { NativeType } from './native';
import { convertStringValueToNative, convertStringValueToType } from './string';
import { convertUint64ValueToNative } from './uint';

export function convertToNative(value: Value, type: NativeType) {
  switch (value.kind.case) {
    case 'boolValue':
      return convertBoolValueToNative(value, type);
    case 'bytesValue':
      return convertBytesValueToNative(value, type);
    case 'doubleValue':
      return convertDoubleValueToNative(value, type);
    case 'int64Value':
      return convertInt64ValueToNative(value, type);
    case 'stringValue':
      return convertStringValueToNative(value, type);
    case 'uint64Value':
      return convertUint64ValueToNative(value, type);
    default:
      return new Error('no such overload');
  }
}

export function convertToType(value: Value, type: Type) {
  switch (value.kind.case) {
    case 'boolValue':
      return convertBoolValueToType(value, type);
    case 'bytesValue':
      return convertBytesValueToType(value, type);
    case 'doubleValue':
      return convertDoubleValueToType(value, type);
    case 'int64Value':
      return convertInt64ValueToType(value, type);
    case 'stringValue':
      return convertStringValueToType(value, type);
    case 'uint64Value':
      return convertStringValueToType(value, type);
    default:
      return new Error('no such overload');
  }
}
