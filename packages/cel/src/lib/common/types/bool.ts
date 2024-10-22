import {
  Type,
  Type_PrimitiveType,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb.js';
import { primitiveType } from './primitive';

export const BOOL_TYPE = primitiveType(Type_PrimitiveType.BOOL);

export function isBoolType(type: Type) {
  return (
    type.typeKind.case === 'primitive' &&
    type.typeKind.value === Type_PrimitiveType.BOOL
  );
}
