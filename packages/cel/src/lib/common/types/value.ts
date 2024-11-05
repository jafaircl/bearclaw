/* eslint-disable @typescript-eslint/no-explicit-any */
import { isBigInt, isBoolean, isNumber, isString, isType } from '@bearclaw/is';
import {
  Value,
  ValueSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb';
import { isMessage } from '@bufbuild/protobuf';
import { DurationSchema, TimestampSchema } from '@bufbuild/protobuf/wkt';
import { BOOL_TRAITS, boolValue } from './bool';
import { BYTES_TRAITS, bytesValue } from './bytes';
import { DOUBLE_TRAITS, doubleValue } from './double';
import { durationValue } from './duration';
import { INT64_TRAITS, int64Value } from './int';
import { STRING_TRAITS, stringValue } from './string';
import { timestampValue } from './timestamp';
import { Trait } from './traits/trait';
import { UINT64_TRAITS } from './uint';

/**
 * Convert an arbitrary value to a CEL Value.
 *
 * @param obj the object to convert to a Value
 * @returns a CEL Value or an Error
 */
export function valueOf(obj: any): Value | Error {
  if (isMessage(obj, ValueSchema)) {
    return obj;
  }
  if (isBoolean(obj)) {
    return boolValue(obj);
  }
  if (isType(obj, 'Uint8Array')) {
    return bytesValue(obj);
  }
  if (isString(obj)) {
    return stringValue(obj);
  }
  if (isNumber(obj)) {
    return doubleValue(obj);
  }
  if (isBigInt(obj)) {
    return int64Value(obj);
  }
  if (isMessage(obj, TimestampSchema)) {
    return timestampValue(obj);
  }
  if (isMessage(obj, DurationSchema)) {
    return durationValue(obj);
  }
  return new Error(`cannot convert ${obj} to Value`);
}

export function valueHasTrait(value: Value, trait: Trait): boolean {
  switch (value.kind.case) {
    case 'boolValue':
      return BOOL_TRAITS.has(trait);
    case 'bytesValue':
      return BYTES_TRAITS.has(trait);
    case 'doubleValue':
      return DOUBLE_TRAITS.has(trait);
    case 'int64Value':
      return INT64_TRAITS.has(trait);
    case 'stringValue':
      return STRING_TRAITS.has(trait);
    case 'uint64Value':
      return UINT64_TRAITS.has(trait);
    // TODO: other types
    default:
      return false;
  }
}
