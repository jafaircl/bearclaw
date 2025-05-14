import { create } from '@bufbuild/protobuf';
import {
  Type,
  Type_PrimitiveType,
  TypeSchema,
} from '../../protogen/cel/expr/checked_pb.js';

export function wrapperType(value: Type_PrimitiveType) {
  return create(TypeSchema, {
    typeKind: {
      case: 'wrapper',
      value,
    },
  });
}

export function isWrapperType(
  val: Type
): val is Type & { typeKind: { case: 'wrapper'; value: Type_PrimitiveType } } {
  return val.typeKind.case === 'wrapper';
}

export function unwrapWrapperType(val: Type) {
  if (isWrapperType(val)) {
    return val.typeKind.value;
  }
  return null;
}
