import {
  Type,
  TypeSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb.js';
import { create } from '@bufbuild/protobuf';
import { NullValue } from '@bufbuild/protobuf/wkt';

export const NULL_TYPE = create(TypeSchema, {
  typeKind: {
    case: 'null',
    value: NullValue.NULL_VALUE,
  },
});

export function isNullType(type: Type): type is Type & {
  typeKind: { case: 'null'; value: NullValue };
} {
  return type.typeKind.case === 'null';
}

export function unwrapNullType(type: Type) {
  if (isNullType(type)) {
    return type.typeKind.value;
  }
  return null;
}
