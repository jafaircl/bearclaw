/* eslint-disable no-case-declarations */
import { isNil } from '@bearclaw/is';
import { FieldBehavior } from '@buf/googleapis_googleapis.bufbuild_es/google/api/field_behavior_pb.js';
import {
  DescField,
  DescMessage,
  isFieldSet,
  Message,
  MessageShape,
} from '@bufbuild/protobuf';
import { FieldMask } from '@bufbuild/protobuf/wkt';
import { getField } from '../common/fields';
import { InvalidArgumentError } from '../errors/errors';
import {
  fieldMask,
  fieldMaskHasPath,
  fieldMaskIsEmpty,
} from '../fieldmask/fieldmask';
import { hasFieldBehavior } from './fieldbehavior';

/**
 * ValidateImmutableFields throws a validation error if the message
 * contains a field that is immutable and a change to an immutable field is
 * requested. This can be used when validating update requests and want to
 * return INVALID_ARGUMENT to the user. If you want to ignore immutable
 * fields rather than error then use clearFieldsWithBehaviors().
 *
 * See: https://aip.dev/203
 *
 * @param schema the schema of the message to validate
 * @param message the message to validate
 * @throws an error if any immutable fields are in the specified message.
 */
export function validateImmutableFields(
  schema: DescMessage,
  message: MessageShape<DescMessage>
): void {
  return _validateImmutableFields(schema, message, fieldMask(['*']));
}

/**
 * ValidateImmutableFieldsWithMask throws a validation error if the message
 * or field mask contains a field that is immutable and a change to an
 * immutable field is requested. This can be used when validating update
 * requests and want to return INVALID_ARGUMENT to the user. If you want to
 * ignore immutable fields rather than error then use
 * clearFieldsWithBehaviors().
 *
 * See: https://aip.dev/203
 *
 * @param schema the schema of the message to validate
 * @param message the message to validate
 * @param fieldMask the field mask to use for validation
 * @throws an error if any immutable fields are in the specified message or
 * field mask.
 */
export function validateImmutableFieldsWithMask(
  schema: DescMessage,
  message: MessageShape<DescMessage>,
  fieldMask: FieldMask
) {
  return _validateImmutableFields(schema, message, fieldMask);
}

function _validateImmutableFields<Desc extends DescMessage>(
  schema: Desc,
  message: MessageShape<Desc>,
  fieldMask: FieldMask,
  path = '',
  parentField: DescField | null = null
) {
  // If no paths are provided, the field mask should be treated to be equivalent
  // to all fields set on the wire. This means that no required fields can be
  // missing, since if they were missing they're not set on the wire.
  if (fieldMaskIsEmpty(fieldMask)) {
    return;
  }
  for (const field of schema.fields) {
    let currPath = path;
    if (currPath.length > 0) {
      currPath += '.';
    }
    currPath += field.name;
    // If the field is part of an array or map, we need to build a path with a
    // wildcard i.e. foo.0.bar -> foo.*.bar
    const parentIsListOrMap =
      parentField?.fieldKind === 'list' || parentField?.fieldKind === 'map';
    let listOrMapCurrPath = parentIsListOrMap
      ? path.split('.').slice(0, -1).join('.')
      : path;
    if (parentIsListOrMap) {
      listOrMapCurrPath += `.*.${field.name}`;
    }
    if (
      isFieldSet(message, field) &&
      hasFieldBehavior(field, FieldBehavior.IMMUTABLE) &&
      (fieldMaskHasPath(fieldMask, currPath) ||
        (parentIsListOrMap && fieldMaskHasPath(fieldMask, listOrMapCurrPath)))
    ) {
      throw new InvalidArgumentError(`field is immutable: ${currPath}`, {
        errorInfo: {
          reason: 'IMMUTABLE_FIELD',
          domain: 'bearclaw.aip.fieldbehavior',
          metadata: {
            field: currPath,
          },
        },
      });
    } else if (field.message) {
      const value = getField(message, field);
      switch (field.fieldKind) {
        case 'list':
          const list = value as Message[];
          for (let i = 0; i < (value as Message[]).length; i++) {
            _validateImmutableFields(
              field.message,
              list[i],
              fieldMask,
              `${currPath}.${i}`,
              field
            );
          }
          break;
        case 'map':
          for (const [k, v] of Object.entries(
            value as Record<string, Message>
          )) {
            _validateImmutableFields(
              field.message,
              v,
              fieldMask,
              `${currPath}.${k}`,
              field
            );
          }
          break;
        case 'message':
          if (!isNil(value)) {
            _validateImmutableFields(
              field.message,
              value as Message,
              fieldMask,
              currPath,
              field
            );
          }
          break;
        default:
          break;
      }
    }
  }
}
