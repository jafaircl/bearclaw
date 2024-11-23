/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { isNil } from '@bearclaw/is';
import {
  Type as ProtoType,
  Type_PrimitiveType,
  Type_WellKnownType,
  TypeSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb.js';
import { toJsonString } from '@bufbuild/protobuf';
import { newPrimitiveProtoType } from './pb/types';
import { Kind, Type } from './types/types';

/**
 * FormatCheckedType converts a type message into a string representation.
 */
export function formatCheckedType(t: ProtoType): string {
  switch (t.typeKind.case) {
    case 'dyn':
      return 'dyn';
    case 'function':
      return formatFunctionExprType(
        t.typeKind.value.resultType!,
        t.typeKind.value.argTypes,
        false
      );
    case 'listType':
      return `list(${formatCheckedType(t.typeKind.value.elemType!)})`;
    case 'messageType':
      return t.typeKind.value;
    case 'mapType':
      const keyType = formatCheckedType(t.typeKind.value.keyType!);
      const valueType = formatCheckedType(t.typeKind.value.valueType!);
      return `map(${keyType}, ${valueType})`;
    case 'null':
      return 'null';
    case 'primitive':
      switch (t.typeKind.value) {
        case Type_PrimitiveType.INT64:
          return 'int';
        case Type_PrimitiveType.UINT64:
          return 'uint';
        default:
          return Type_PrimitiveType[t.typeKind.value].toLowerCase();
      }
    case 'type':
      const nestedType = t.typeKind.value;
      if (isNil(nestedType)) {
        return 'type';
      }
      return `type(${formatCheckedType(nestedType)})`;
    case 'wellKnown':
      switch (t.typeKind.value) {
        case Type_WellKnownType.ANY:
          return 'any';
        case Type_WellKnownType.DURATION:
          return 'duration';
        case Type_WellKnownType.TIMESTAMP:
          return 'timestamp';
        default:
          return '';
      }
    case 'wrapper':
      return `wrapper(${formatCheckedType(
        newPrimitiveProtoType(t.typeKind.value)
      )})`;
    case 'error':
      return '!error!';
    case 'typeParam':
      return t.typeKind.value;
    case 'abstractType':
      const at = t.typeKind.value;
      const params = at.parameterTypes.map((p) => formatCheckedType(p));
      return `${at.name}(${params.join(', ')})`;
    default:
      return toJsonString(TypeSchema, t);
  }
}

/**
 * FormatCELType formats a types.Type value to a string representation.
//
// The type formatting is identical to FormatCheckedType.
 */
export function formatCELType(t: Type): string {
  switch (t.kind()) {
    case Kind.ANY:
      return 'any';
    case Kind.DURATION:
      return 'duration';
    case Kind.ERROR:
      return '!error!';
    case Kind.NULL:
      return 'null';
    case Kind.TIMESTAMP:
      return 'timestamp';
    case Kind.TYPEPARAM:
      return t.typeName();
    case Kind.OPAQUE:
      if (t.typeName() === 'function') {
        // There is no explicit function type in the new types representation,
        // so information like whether the function is a member function is
        // absent.
        return formatFunctionDeclType(
          t.parameters()[0],
          t.parameters().slice(1),
          false
        );
      }
      break;
    case Kind.UNSPECIFIED:
      return '';
    default:
      break;
  }
  if (t.parameters().length === 0) {
    return t.typeName();
  }
  const paramTypeNames = t.parameters().map((p) => formatCELType(p));
  return `${t.typeName()}(${paramTypeNames.join(', ')})`;
}

function formatExprType(t: any): string {
  if (isNil(t)) {
    return '';
  }
  return formatCheckedType(t);
}

export function formatFunctionExprType(
  resultType: ProtoType | null,
  argTypes: ProtoType[],
  isInstance: boolean
): string {
  return formatFunctionInternal(
    resultType,
    argTypes,
    isInstance,
    formatExprType
  );
}

export function formatFunctionDeclType(
  resultType: Type | null,
  argTypes: Type[],
  isInstance: boolean
) {
  return formatFunctionInternal(
    resultType,
    argTypes,
    isInstance,
    formatCELType
  );
}

function formatFunctionInternal<T = any>(
  resultType: T | null,
  argTypes: T[],
  isInstance: boolean,
  format: (t: T) => string
): string {
  let result = '';
  if (isInstance) {
    const target = argTypes[0];
    argTypes = argTypes.slice(1);
    result += format(target) + '.';
  }
  result += '(';
  for (let i = 0; i < argTypes.length; i++) {
    if (i > 0) {
      result += ', ';
    }
    result += format(argTypes[i]);
  }
  result += ')';
  const rt = resultType ? format(resultType) : null;
  if (!isNil(rt)) {
    result += ' -> ' + rt;
  }
  return result;
}
