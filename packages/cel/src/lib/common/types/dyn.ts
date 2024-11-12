import {
  Type,
  TypeSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb';
import { create } from '@bufbuild/protobuf';
import { Empty, EmptySchema } from '@bufbuild/protobuf/wkt';

export const DYN_CEL_TYPE = create(TypeSchema, {
  typeKind: {
    case: 'dyn',
    value: create(EmptySchema),
  },
});

export function isDynType(val: Type): val is Type & {
  typeKind: { case: 'dyn'; value: Empty };
} {
  return val.typeKind.case === 'dyn';
}

export function unwrapDynType(val: Type) {
  if (isDynType(val)) {
    return val.typeKind.value;
  }
  return null;
}
