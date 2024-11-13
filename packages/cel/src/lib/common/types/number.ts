import { Value } from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb.js';
import { RefTypeEnum, RefVal } from '../ref/reference';
import { DoubleRefVal, isDoubleValue } from './double';
import { IntRefVal, isInt64Value } from './int';
import { isUint64Value, UintRefVal } from './uint';

export function isNumberValue(value: Value): value is Value & {
  kind:
    | { case: 'doubleValue'; value: number }
    | { case: 'int64Value'; value: bigint }
    | { case: 'uint64Value'; value: bigint };
} {
  return isDoubleValue(value) || isInt64Value(value) || isUint64Value(value);
}

export function isNumberRefVal(
  value: RefVal
): value is DoubleRefVal | IntRefVal | UintRefVal {
  switch (value.type().typeName()) {
    case RefTypeEnum.DOUBLE:
    case RefTypeEnum.INT:
    case RefTypeEnum.UINT:
      return true;
    default:
      return false;
  }
}

export function unwrapNumberValue(value: Value): number | bigint | null {
  switch (value.kind.case) {
    case 'int64Value':
    case 'uint64Value':
    case 'doubleValue':
      return value.kind.value;
    default:
      return null;
  }
}
