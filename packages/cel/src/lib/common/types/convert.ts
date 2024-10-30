import { Type } from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb.js';
import { Value } from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb.js';
import { convertBoolValueToNative, convertBoolValueToType } from './bool';
import { convertBytesValueToNative, convertBytesValueToType } from './bytes';
import { convertDoubleValueToNative, convertDoubleValueToType } from './double';
import { NativeType } from './native';

export function convertToNative(value: Value, type: NativeType) {
  switch (value.kind.case) {
    case 'boolValue':
      return convertBoolValueToNative(value, type);
    case 'bytesValue':
      return convertBytesValueToNative(value, type);
    case 'doubleValue':
      return convertDoubleValueToNative(value, type);
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
    default:
      return new Error('no such overload');
  }
}
