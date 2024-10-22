import {
  Type,
  TypeSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb.js';
import { create } from '@bufbuild/protobuf';

export function typeParamType(value: string) {
  return create(TypeSchema, {
    typeKind: {
      case: 'typeParam',
      value,
    },
  });
}

export function isTypeParamType(val: Type): val is Type & {
  typeKind: { case: 'typeParam'; value: string };
} {
  return val.typeKind.case === 'typeParam';
}

export function unwrapTypeParamType(val: Type) {
  if (isTypeParamType(val)) {
    return val.typeKind.value;
  }
  return null;
}
