import {
  Type,
  TypeSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb.js';
import {
  Value,
  ValueSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb';
import { create } from '@bufbuild/protobuf';
import { formatCELType } from '../format';

export function typeType(value: Type) {
  return create(TypeSchema, {
    typeKind: {
      case: 'type',
      value,
    },
  });
}

export const TYPE_TYPE = create(TypeSchema, {
  typeKind: {
    case: 'type',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: null as any,
  },
});

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

export function typeValue(value: Type) {
  return create(ValueSchema, {
    kind: {
      case: 'typeValue',
      value: formatCELType(value),
    },
  });
}

export function isTypeValue(value: Value): value is Value & {
  kind: { case: 'typeValue'; value: string };
} {
  return value.kind.case === 'typeValue';
}
