import {
  Type,
  TypeSchema,
  Type_ListTypeSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb.js';
import { MessageInitShape, create } from '@bufbuild/protobuf';

export function listType(value: MessageInitShape<typeof Type_ListTypeSchema>) {
  return create(TypeSchema, {
    typeKind: {
      case: 'listType',
      value,
    },
  });
}

export function isListType(val: Type): val is Type & {
  typeKind: {
    case: 'listType';
    value: MessageInitShape<typeof Type_ListTypeSchema>;
  };
} {
  return val.typeKind.case === 'listType';
}

export function unwrapListElemType(val: Type) {
  if (isListType(val)) {
    return val.typeKind.value.elemType;
  }
  return null;
}
