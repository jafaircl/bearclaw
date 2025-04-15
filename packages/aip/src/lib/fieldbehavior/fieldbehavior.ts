import {
  field_behavior,
  FieldBehavior,
} from '@buf/googleapis_googleapis.bufbuild_es/google/api/field_behavior_pb.js';
import {
  clearField,
  clone,
  DescField,
  DescMessage,
  getOption,
  isFieldSet,
  Message,
  MessageShape,
} from '@bufbuild/protobuf';
import { getField } from '../common/fields';

/**
 * Get returns the field behavior of the provided field descriptor.
 *
 * @param field the field descriptor to get the field behavior for
 * @returns the field behavior of the field descriptor
 */
export function getFieldBehavior(field: DescField): FieldBehavior[] {
  return getOption(field, field_behavior);
}

/**
 * Has returns true if the provided field descriptor has the wanted field
 * behavior.
 *
 * @param field the field descriptor to check
 * @param behavior the field behavior to check for
 * @returns true if the field descriptor has the wanted field behavior
 */
export function hasFieldBehavior(
  field: DescField,
  behavior: FieldBehavior
): boolean {
  const behaviors = getFieldBehavior(field);
  return behaviors.some((b) => b === behavior);
}

/**
 * HasAnyFieldBehavior returns true if the provided field descriptor has any
 * of the wanted field behaviors.
 *
 * @param field the field descriptor to check
 * @param behaviors the field behaviors to check for
 * @returns true if the field descriptor has any of the wanted field behaviors
 */
export function hasAnyFieldBehavior(
  field: DescField,
  behaviors: FieldBehavior[]
) {
  for (const behavior of behaviors) {
    if (hasFieldBehavior(field, behavior)) {
      return true;
    }
  }
  return false;
}

/**
 * ClearFields clears all fields annotated with any of the provided behaviors.
 * This can be used to ignore fields provided as input that have
 * field_behavior's such as OUTPUT_ONLY and IMMUTABLE.
 *
 * See: https://google.aip.dev/161#output-only-fields
 *
 * @param schema the message schema to clear fields from
 * @param message the message to clear fields from
 * @param behaviors the field behaviors to clear
 * @param shouldMutate whether to mutate the original message or return a clone
 * @returns a copy or the original message with the fields cleared depending on
 * the `shouldClone` parameter
 */
export function clearFieldsWithBehaviors<Desc extends DescMessage>(
  schema: Desc,
  message: MessageShape<Desc>,
  behaviors: FieldBehavior[],
  shouldMutate = false
) {
  const copy = shouldMutate ? message : clone(schema, message);
  for (const field of schema.fields) {
    if (!isFieldSet(copy, field)) {
      // If the field is not set, we don't need to clear it.
      continue;
    }
    if (hasAnyFieldBehavior(field, behaviors)) {
      clearField(copy, field);
      // If we clear this field, we don't need to bother with any children since
      // they will have been cleared as well.
      continue;
    }
    switch (field.fieldKind) {
      case 'list':
        if (field.listKind === 'message') {
          for (const item of getField(copy, field) as Message[]) {
            clearFieldsWithBehaviors(field.message, item, behaviors, true);
          }
        }
        break;
      case 'map':
        if (field.mapKind === 'message') {
          for (const value of Object.values(
            getField(copy, field) as Record<string, Message>
          )) {
            clearFieldsWithBehaviors(field.message, value, behaviors, true);
          }
        }
        break;
      case 'message':
        clearFieldsWithBehaviors(
          field.message,
          getField(copy, field) as Message,
          behaviors,
          true
        );
        break;
      default:
        break;
    }
  }
  return copy;
}
