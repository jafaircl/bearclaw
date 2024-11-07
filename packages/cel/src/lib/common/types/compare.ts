import { Value } from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb.js';
import { RefVal } from '../ref/reference';
import { ErrorRefVal } from './error';
import { IntRefVal, int64Value } from './int';
import { isNumberRefVal, isNumberValue } from './number';

export function compareNumberValues(value: Value, other: Value) {
  if (!isNumberValue(value)) {
    return new Error('value is not a number (double, int64, or uint64)');
  }
  if (!isNumberValue(other)) {
    return new Error('other is not a number (double, int64, or uint64)');
  }
  if (value.kind.value < other.kind.value) {
    return int64Value(BigInt(-1));
  }
  if (value.kind.value > other.kind.value) {
    return int64Value(BigInt(1));
  }
  return int64Value(BigInt(0));
}

export function compareNumberRefVals(
  val: RefVal,
  other: RefVal
): IntRefVal | ErrorRefVal {
  if (!isNumberRefVal(val)) {
    return ErrorRefVal.maybeNoSuchOverload(val) as ErrorRefVal;
  }
  if (!isNumberRefVal(other)) {
    return ErrorRefVal.maybeNoSuchOverload(other) as ErrorRefVal;
  }
  if (val.value() < other.value()) {
    return IntRefVal.IntNegOne;
  }
  if (val.value() > other.value()) {
    return IntRefVal.IntOne;
  }
  return IntRefVal.IntZero;
}
