/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-case-declarations */
import { isNil } from '@bearclaw/is';
import {
  Type,
  Type_PrimitiveType,
  Type_PrimitiveTypeSchema,
  Type_WellKnownType,
  Type_WellKnownTypeSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb.js';
import { enumToJson } from '@bufbuild/protobuf';
import { formatFunctionType } from '../checker/types';
import { primitiveType } from './types/primitive';

export function formatCELType(t: Type | null): string {
  switch (t?.typeKind.case) {
    case 'primitive':
      switch (t.typeKind.value) {
        case Type_PrimitiveType.BOOL:
          return 'bool';
        case Type_PrimitiveType.BYTES:
          return 'bytes';
        case Type_PrimitiveType.DOUBLE:
          return 'double';
        case Type_PrimitiveType.INT64:
          return 'int';
        case Type_PrimitiveType.STRING:
          return 'string';
        case Type_PrimitiveType.UINT64:
          return 'uint';
        default:
          return enumToJson(
            Type_PrimitiveTypeSchema,
            t.typeKind.value
          ) as string;
      }
    case 'wellKnown':
      switch (t.typeKind.value) {
        case Type_WellKnownType.ANY:
          return 'any';
        case Type_WellKnownType.DURATION:
          return 'duration';
        case Type_WellKnownType.TIMESTAMP:
          return 'timestamp';
        default:
          return enumToJson(
            Type_WellKnownTypeSchema,
            t.typeKind.value
          ) as string;
      }
    case 'error':
      return '!error!';
    case 'null':
      return 'null';
    case 'typeParam':
      return t.typeKind.value;
    case 'abstractType':
      const at = t.typeKind.value;
      return `${at.name}(${at.parameterTypes.map(formatCELType).join(', ')})`;
    case 'listType':
      return `list(${formatCELType(t.typeKind.value.elemType!)})`;
    case 'type':
      if (isNil(t.typeKind.value) || isNil(t.typeKind.value.typeKind.value)) {
        return 'type';
      }
      return formatCELType(t.typeKind.value);
    case 'messageType':
      return t.typeKind.value;
    case 'mapType':
      const keyType = formatCELType(t.typeKind.value.keyType!);
      const valueType = formatCELType(t.typeKind.value.valueType!);
      return `map(${keyType}, ${valueType})`;
    case 'dyn':
      return 'dyn';
    case 'function':
      return formatFunctionType(
        t.typeKind.value.resultType!,
        t.typeKind.value.argTypes,
        false
      );
    case 'wrapper':
      return `wrapper(${formatCELType(primitiveType(t.typeKind.value))})`;
  }
  return '';
}
