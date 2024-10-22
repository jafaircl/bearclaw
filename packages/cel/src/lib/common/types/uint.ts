import {
  Type,
  Type_PrimitiveType,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb.js';
import { primitiveType } from './primitive';

export const UINT64_TYPE = primitiveType(Type_PrimitiveType.UINT64);

export function isUint64Type(type: Type): type is Type & {
  typeKind: { case: 'primitive'; value: Type_PrimitiveType };
} {
  return (
    type.typeKind.case === 'primitive' &&
    type.typeKind.value === Type_PrimitiveType.UINT64
  );
}

export function unwrapUnit64Type(type: Type) {
  if (isUint64Type(type)) {
    return type.typeKind.value;
  }
  return null;
}
