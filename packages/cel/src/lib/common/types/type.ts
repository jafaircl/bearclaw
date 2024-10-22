import {
  Type,
  TypeSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb.js';
import { create } from '@bufbuild/protobuf';

export function typeType(value: Type) {
  return create(TypeSchema, {
    typeKind: {
      case: 'type',
      value,
    },
  });
}

export function isTypeType(value: Type): value is Type & {
  typeKind: { case: 'type'; value: Type };
} {
  return value.typeKind.case === 'type';
}

export function unwrapTypeType(value: Type) {
  if (isTypeType(value)) {
    return value.typeKind.value;
  }
  return null;
}
