import { Value } from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb.js';
import { newIntProtoValue } from '../pb/values';
import { RefVal } from '../ref/reference';
import { ErrorRefVal } from './error';
import { IntRefVal } from './int';
import { isNumberProtoValue, isNumberRefVal } from './number';

export function compareNumberValues(value: Value, other: Value) {
  if (!isNumberProtoValue(value)) {
    return new Error('value is not a number (double, int64, or uint64)');
  }
  if (!isNumberProtoValue(other)) {
    return new Error('other is not a number (double, int64, or uint64)');
  }
  if (value.kind.value < other.kind.value) {
    return newIntProtoValue(BigInt(-1));
  }
  if (value.kind.value > other.kind.value) {
    return newIntProtoValue(BigInt(1));
  }
  return newIntProtoValue(BigInt(0));
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
