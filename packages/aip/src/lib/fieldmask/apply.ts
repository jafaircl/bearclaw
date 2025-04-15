/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { isNil } from '@bearclaw/is';
import {
  clearField,
  clone,
  create,
  DescMessage,
  isFieldSet,
  Message,
  MessageShape,
  toJsonString,
} from '@bufbuild/protobuf';
import { FieldMask, FieldMaskSchema } from '@bufbuild/protobuf/wkt';
import { getField, setField } from '../common/fields';
import { isValidFieldMask } from './validate';

/**
 * Applies a field mask to a message, creating a new message with only the
 * fields specified in the field mask. If the inverse argument is true, the
 * inverse of the field mask is applied, meaning that only the fields not
 * specified in the field mask are included in the new message.
 *
 * @param schema the message schema to apply the field mask to
 * @param message the message to apply the field mask to
 * @param fieldMask the field mask to apply
 * @param inverse a boolean indicating whether to apply the inverse of the field mask
 * @returns a copy of the message with the field mask applied
 */
export function applyFieldMask<Desc extends DescMessage>(
  schema: Desc,
  message: MessageShape<Desc>,
  fieldMask: FieldMask,
  inverse = false
) {
  if (!isValidFieldMask(fieldMask, schema)) {
    throw new Error(
      `invalid field mask for schema ${schema.typeName}: ${toJsonString(
        FieldMaskSchema,
        fieldMask
      )}`
    );
  }
  const copy = inverse ? clone(schema, message) : create(schema);
  for (const path of fieldMask.paths) {
    if (path === '*') {
      return inverse ? create(schema) : clone(schema, message);
    }
    applyPath(schema, copy, message, path.split('.'), inverse);
  }
  return copy;
}

function applyPath<Desc extends DescMessage>(
  schema: Desc,
  target: MessageShape<Desc>,
  source: MessageShape<Desc>,
  segments: string[],
  inverse: boolean
) {
  if (segments.length === 0) {
    return;
  }
  const field = schema.fields.find((f) => f.name === segments[0]);
  if (isNil(field)) {
    // No known field by that name
    return;
  }
  // The segment is a single named field in this message
  if (segments.length === 1) {
    if (inverse) {
      clearField(target, field);
    } else {
      setField(target, field, getField(source, field));
    }
  }
  // A named field in a nested message. The field can be a wildcard as long as
  // the previous field was a list or map. For example: `map_uint64_timestamp.*
  // seconds` might be valid since `map_uint64_timestamp` is presumably a map
  // with timestamp message values. See: https://google.aip.dev/161#wildcards
  switch (field.fieldKind) {
    case 'list':
      if (segments[1] === '*' && field.listKind === 'message') {
        const sourceList = getField(source, field) as Message[];
        const targetList = getField(target, field) as Message[];
        for (let i = 0; i < sourceList.length; i++) {
          targetList[i] = inverse
            ? clone(field.message, sourceList[i])
            : create(field.message);
          applyPath(
            field.message,
            targetList[i],
            sourceList[i],
            segments.slice(2),
            inverse
          );
        }
      }
      break;
    case 'map':
      if (segments[1] === '*' && field.mapKind === 'message') {
        const sourceMap = getField(source, field) as Record<any, Message>;
        const targetMap = getField(target, field) as Record<any, Message>;
        for (const [key, sourceValue] of Object.entries(sourceMap)) {
          targetMap[key] = inverse
            ? clone(field.message, sourceValue)
            : create(field.message);
          applyPath(
            field.message,
            targetMap[key],
            sourceValue,
            segments.slice(2),
            inverse
          );
        }
      }
      break;
    case 'message':
      const sourceValue = getField(source, field) as Message;
      if (!isFieldSet(target, field) && !inverse) {
        setField(target, field, create(field.message));
      }
      const targetValue = getField(target, field) as Message;
      applyPath(
        field.message,
        targetValue,
        sourceValue,
        segments.slice(1),
        inverse
      );
      break;
    default:
      break;
  }
}
