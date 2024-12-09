/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-case-declarations */
import { RefVal } from '../ref/reference';
import { ErrorRefVal } from './error';
import { ErrorType, UnknownType } from './types';
import { UnknownRefVal } from './unknown';

export function typeNameToUrl(name: string): string {
  return `type.googleapis.com/${name}`;
}

export function typeUrlToName(url: string): string {
  return url.replace('type.googleapis.com/', '');
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
