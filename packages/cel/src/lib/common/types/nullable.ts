import { Type } from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb.js';
import { abstractType, isAbstractType } from './abstract';

export function nullableType(value: Type) {
  return abstractType({ name: 'nullable_type', parameterTypes: [value] });
}

export function isNullableType(val: Type): val is Type & {
  typeKind: {
    case: 'abstractType';
    value: { name: 'nullable_type'; parameterTypes: [Type] };
  };
} {
  return isAbstractType(val) && val.typeKind.value.name === 'nullable_type';
}

export function unwrapNullableType(val: Type) {
  if (isNullableType(val)) {
    return val.typeKind.value.parameterTypes[0];
  }
  return null;
}

export function maybeUnwrapNullableType(val: Type) {
  return isNullableType(val) ? unwrapNullableType(val) : val;
}

export const ABSTRACT_NULLABLE_TYPE = abstractType({ name: 'nullable_type' });
