import {
  Type,
  Type_PrimitiveType,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb.js';
import { primitiveType } from './primitive';

export const BYTES_TYPE = primitiveType(Type_PrimitiveType.BYTES);

export function isBytesType(val: Type) {
  return (
    val.typeKind.case === 'primitive' &&
    val.typeKind.value === Type_PrimitiveType.BYTES
  );
}
