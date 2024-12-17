import { Value } from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb.js';
import {
  isDoubleProtoValue,
  isIntProtoValue,
  isUintProtoValue,
} from '../pb/values';
import { RefVal } from '../ref/reference';
import { DoubleRefVal } from './double';
import { IntRefVal } from './int';
import { DoubleType, IntType, UintType } from './types';
import { UintRefVal } from './uint';

export function isNumberProtoValue(value: Value): value is Value & {
  kind:
    | { case: 'doubleValue'; value: number }
    | { case: 'int64Value'; value: bigint }
    | { case: 'uint64Value'; value: bigint };
} {
  return (
    isDoubleProtoValue(value) ||
    isIntProtoValue(value) ||
    isUintProtoValue(value)
  );
}

export function isNumberRefVal(
  value: RefVal
): value is DoubleRefVal | IntRefVal | UintRefVal {
  switch (value.type()) {
    case DoubleType:
    case IntType:
    case UintType:
      return true;
    default:
      return false;
  }
}

export function unwrapNumberProtoValue(value: Value): number | bigint | null {
  switch (value.kind.case) {
    case 'int64Value':
    case 'uint64Value':
    case 'doubleValue':
      return value.kind.value;
    default:
      return null;
  }
}
