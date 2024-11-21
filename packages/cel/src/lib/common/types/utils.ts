/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-case-declarations */
import { isEmpty, isEmptyArray, isEmptyObject } from '@bearclaw/is';
import { DescField, Message } from '@bufbuild/protobuf';
import { isScalarZeroValue } from '@bufbuild/protobuf/reflect';
import { RefVal } from '../ref/reference';
import { ErrorRefVal } from './error';
import { ErrorType, UnknownType } from './types';
import { UnknownRefVal } from './unknown';

export function typeNameToUrl(name: string): string {
  return `type.googleapis.com/${name}`;
}

export function getFieldValueFromMessage<T = any>(
  field: DescField,
  value: Message
): T {
  return (value as any)[field.name] ?? (value as any)[field.jsonName];
}

export function isMessageFieldSet(field: DescField, value: Message): boolean {
  const fieldValue = getFieldValueFromMessage(field, value);
  switch (field.fieldKind) {
    case 'scalar':
      return !isScalarZeroValue(field.scalar, fieldValue);
    case 'enum':
      // Try to get the default value of the enum field if it exists or use 0.
      return fieldValue !== (field.getDefaultValue() ?? 0);
    case 'list':
      return !isEmptyArray(fieldValue);
    case 'map':
      return !isEmptyObject(fieldValue);
    default:
      return !isEmpty(fieldValue);
  }
}

export function sanitizeProtoName(name: string) {
  name = name.trim();
  if (name !== '' && name.charAt(0) === '.') {
    return name.substring(1);
  }
  return name;
}

/**
 * IsUnknownOrError returns whether the input element ref.Val is an ErrType or UnknownType.
 */
export function isUnknownOrError(
  val: RefVal
): val is ErrorRefVal | UnknownRefVal {
  switch (val.type()) {
    case ErrorType:
    case UnknownType:
      return true;
    default:
      return false;
  }
}
