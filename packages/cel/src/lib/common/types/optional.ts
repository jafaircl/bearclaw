import { Type } from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb.js';
import { abstractType, isAbstractType } from './abstract';

export function optionalType(value: Type) {
  return abstractType({ name: 'optional_type', parameterTypes: [value] });
}

export function isOptionalType(val: Type): val is Type & {
  typeKind: {
    case: 'abstractType';
    value: { name: 'optional_type'; parameterTypes: [Type] };
  };
} {
  if (!isAbstractType(val)) {
    return false;
  }
  return val.typeKind.value.name === 'optional_type';
}

export function unwrapOptionalType(val: Type) {
  if (isOptionalType(val)) {
    return val.typeKind.value.parameterTypes[0];
  }
  return null;
}

export function maybeUnwrapOptionalType(val: Type) {
  return isOptionalType(val) ? unwrapOptionalType(val) : val;
}

export const ABSTRACT_OPTIONAL_TYPE = abstractType({ name: 'optional_type' });
