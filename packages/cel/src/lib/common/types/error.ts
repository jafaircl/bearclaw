import {
  Type,
  TypeSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb.js';
import { create } from '@bufbuild/protobuf';
import { Empty, EmptySchema } from '@bufbuild/protobuf/wkt';

export const ERROR_TYPE = create(TypeSchema, {
  typeKind: {
    case: 'error',
    value: create(EmptySchema),
  },
});

export function isErrorType(val: Type): val is Type & {
  typeKind: { case: 'error'; value: Empty };
} {
  return val.typeKind.case === 'error';
}

export function unwrapErrorType(val: Type) {
  if (isErrorType(val)) {
    return val.typeKind.value;
  }
  return null;
}
