import {
  Type,
  Type_PrimitiveType,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb.js';
import { primitiveType } from './primitive';

export const DOUBLE_TYPE = primitiveType(Type_PrimitiveType.DOUBLE);

export function isDoubleType(val: Type): val is Type & {
  typeKind: { case: 'primitive'; value: Type_PrimitiveType.DOUBLE };
} {
  return (
    val.typeKind.case === 'primitive' &&
    val.typeKind.value === Type_PrimitiveType.DOUBLE
  );
}

export function unwrapDoubleType(val: Type) {
  if (isDoubleType(val)) {
    return val.typeKind.value;
  }
  return null;
}
