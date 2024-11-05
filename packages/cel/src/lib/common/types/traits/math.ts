import { Value } from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb.js';
import { addBytesValue } from '../bytes';
import {
  addDoubleValue,
  divideDoubleValue,
  multiplyDoubleValue,
  subtractDoubleValue,
} from '../double';
import {
  addInt64Value,
  divideInt64Value,
  moduloInt64Value,
  multiplyInt64Value,
  subtractInt64Value,
} from '../int';
import { addStringValue } from '../string';
import {
  addUint64Value,
  divideUint64Value,
  moduloUint64Value,
  multiplyUint64Value,
  subtractUint64Value,
} from '../uint';

export function adder(value: Value, other: Value) {
  switch (value.kind.case) {
    case 'bytesValue':
      return addBytesValue(value, other);
    case 'doubleValue':
      return addDoubleValue(value, other);
    case 'int64Value':
      return addInt64Value(value, other);
    case 'stringValue':
      return addStringValue(value, other);
    case 'uint64Value':
      return addUint64Value(value, other);
    default:
      return new Error('no such overload');
  }
}

export function divider(value: Value, other: Value) {
  switch (value.kind.case) {
    case 'doubleValue':
      return divideDoubleValue(value, other);
    case 'int64Value':
      return divideInt64Value(value, other);
    case 'uint64Value':
      return divideUint64Value(value, other);
    default:
      return new Error('no such overload');
  }
}

export function modder(value: Value, other: Value) {
  switch (value.kind.case) {
    case 'int64Value':
      return moduloInt64Value(value, other);
    case 'uint64Value':
      return moduloUint64Value(value, other);
    default:
      return new Error('no such overload');
  }
}

export function multiplier(value: Value, other: Value) {
  switch (value.kind.case) {
    case 'doubleValue':
      return multiplyDoubleValue(value, other);
    case 'int64Value':
      return multiplyInt64Value(value, other);
    case 'uint64Value':
      return multiplyUint64Value(value, other);
    default:
      return new Error('no such overload');
  }
}

export function subtractor(value: Value, other: Value) {
  switch (value.kind.case) {
    case 'doubleValue':
      return subtractDoubleValue(value, other);
    case 'int64Value':
      return subtractInt64Value(value, other);
    case 'uint64Value':
      return subtractUint64Value(value, other);
    default:
      return new Error('no such overload');
  }
}
