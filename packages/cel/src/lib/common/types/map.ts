import {
  Type,
  TypeSchema,
  Type_MapTypeSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb.js';
import { MessageInitShape, create } from '@bufbuild/protobuf';
import { DYN_TYPE } from './dyn';

export const MAP_TYPE = mapType({
  keyType: DYN_TYPE,
  valueType: DYN_TYPE,
});

export function mapType(value: MessageInitShape<typeof Type_MapTypeSchema>) {
  return create(TypeSchema, {
    typeKind: {
      case: 'mapType',
      value,
    },
  });
}

export function isMapType(val: Type): val is Type & {
  typeKind: {
    case: 'mapType';
    value: MessageInitShape<typeof Type_MapTypeSchema>;
  };
} {
  return val.typeKind.case === 'mapType';
}

export function unwrapMapKeyType(val: Type) {
  if (isMapType(val)) {
    return val.typeKind.value.keyType;
  }
  return null;
}

export function unwrapMapValueType(val: Type) {
  if (isMapType(val)) {
    return val.typeKind.value.valueType;
  }
  return null;
}
