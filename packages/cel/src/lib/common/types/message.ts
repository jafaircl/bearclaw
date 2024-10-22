import {
  Type,
  TypeSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb.js';
import { create } from '@bufbuild/protobuf';

export function messageType(value: string) {
  return create(TypeSchema, {
    typeKind: {
      case: 'messageType',
      value,
    },
  });
}

export function isMessageType(val: Type): val is Type & {
  typeKind: { case: 'messageType'; value: string };
} {
  return val.typeKind.case === 'messageType';
}

export function unwrapMessageType(val: Type) {
  if (isMessageType(val)) {
    return val.typeKind.value;
  }
  return null;
}
