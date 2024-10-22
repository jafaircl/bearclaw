import {
  Type,
  Type_PrimitiveType,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb.js';
import { primitiveType } from './primitive';

export const STRING_TYPE = primitiveType(Type_PrimitiveType.STRING);

export function isStringType(val: Type): val is Type & {
  typeKind: { case: 'primitive'; value: Type_PrimitiveType };
} {
  return (
    val.typeKind.case === 'primitive' &&
    val.typeKind.value === Type_PrimitiveType.STRING
  );
}

export function unwrapStringType(val: Type) {
  if (isStringType(val)) {
    return val.typeKind.value;
  }
  return null;
}
