import {
  Type,
  TypeSchema,
  Type_AbstractType,
  Type_AbstractTypeSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb.js';
import { MessageInitShape, create } from '@bufbuild/protobuf';

export function abstractType(
  value: MessageInitShape<typeof Type_AbstractTypeSchema>
) {
  return create(TypeSchema, {
    typeKind: {
      case: 'abstractType',
      value,
    },
  });
}

export function isAbstractType(val: Type): val is Type & {
  typeKind: { case: 'abstractType'; value: Type_AbstractType };
} {
  return val.typeKind.case === 'abstractType';
}

export function unwrapAbstractType(val: Type): Type_AbstractType | null {
  if (isAbstractType(val)) {
    return val.typeKind.value;
  }
  return null;
}

export const ABSTRACT_TYPE_TYPE = abstractType({ name: 'type' });
