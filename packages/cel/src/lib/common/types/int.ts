import {
  Type,
  Type_PrimitiveType,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb.js';
import { primitiveType } from './primitive';

export const INT64_TYPE = primitiveType(Type_PrimitiveType.INT64);

export function isInt64Type(val: Type): val is Type & {
  typeKind: { case: 'primitive'; value: Type_PrimitiveType.INT64 };
} {
  return (
    val.typeKind.case === 'primitive' &&
    val.typeKind.value === Type_PrimitiveType.INT64
  );
}

export function unwrapInt64Type(val: Type) {
  if (isInt64Type(val)) {
    return val.typeKind.value;
  }
  return null;
}
