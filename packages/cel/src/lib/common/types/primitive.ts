import {
  Type,
  Type_PrimitiveType,
  TypeSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb.js';
import { create } from '@bufbuild/protobuf';

export function primitiveType(value: Type_PrimitiveType) {
  return create(TypeSchema, {
    typeKind: {
      case: 'primitive',
      value,
    },
  });
}

export function isPrimitiveType(
  val: Type
): val is Type & {
  typeKind: { case: 'primitive'; value: Type_PrimitiveType };
} {
  return val.typeKind.case === 'primitive';
}

export function unwrapPrimitiveType(val: Type) {
  if (isPrimitiveType(val)) {
    return val.typeKind.value;
  }
  return null;
}
