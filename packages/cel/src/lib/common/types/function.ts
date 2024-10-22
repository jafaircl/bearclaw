import {
  Type,
  TypeSchema,
  Type_FunctionTypeSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb.js';
import { MessageInitShape, create } from '@bufbuild/protobuf';

export function functionType(
  value: MessageInitShape<typeof Type_FunctionTypeSchema>
) {
  return create(TypeSchema, {
    typeKind: {
      case: 'function',
      value,
    },
  });
}

export function isFunctionType(val: Type): val is Type & {
  typeKind: {
    case: 'function';
    value: MessageInitShape<typeof Type_FunctionTypeSchema>;
  };
} {
  return val.typeKind.case === 'function';
}

export function unwrapFunctionType(val: Type) {
  if (isFunctionType(val)) {
    return val.typeKind.value;
  }
  return null;
}
