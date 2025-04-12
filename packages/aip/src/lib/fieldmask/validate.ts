import { isNil } from '@bearclaw/is';
import { DescField, DescMessage } from '@bufbuild/protobuf';
import { FieldMask } from '@bufbuild/protobuf/wkt';

/**
 * Validates that the paths in the provided field mask are syntactically valid
 * and refer to known fields in the specified message type.
 *
 * See https://google.aip.dev/161 for more details about what constitutes a
 * valid field mask.
 *
 * @param fieldMask the field mask to validate
 * @param schema the message schema to validate against
 * @returns whether the field mask is valid
 */
export function isValidFieldMask(fieldMask: FieldMask, schema: DescMessage) {
  for (const path of fieldMask.paths) {
    // Special case for '*' wildcard. If a field is a wildcard, it must be
    // the only path in the field mask.
    if (path === '*') {
      return fieldMask.paths.length === 1;
    }
    let messageDescriptor: DescMessage | null = schema;
    let fieldDescriptor: DescField | null = null;
    const isValid = rangeFields(path, (field) => {
      // The field can be a wildcard as long as the previous field was a list
      // or map. For example: `map_uint64_timestamp.*.seconds` might be valid
      // since `map_uint64_timestamp` is presumably a map with timestamp
      // message values. See: https://google.aip.dev/161#wildcards
      if (field === '*') {
        // If the field descriptor is nil, we cannot have a wildcard.
        if (isNil(fieldDescriptor)) {
          return false;
        }
        switch (fieldDescriptor.fieldKind) {
          case 'list':
          case 'map':
            messageDescriptor = fieldDescriptor.message ?? null;
            return true;
          default:
            // If the field descriptor is not a list or map, we cannot have a wildcard.
            return false;
        }
      }
      // If we are not in a message, we cannot have a field.
      if (isNil(messageDescriptor)) {
        return false;
      }
      fieldDescriptor =
        messageDescriptor.fields.find((f) => f.name === field) ?? null;
      if (isNil(fieldDescriptor)) {
        return false;
      }
      // Identify the next message descriptor.
      switch (fieldDescriptor.fieldKind) {
        case 'message':
          messageDescriptor = fieldDescriptor.message ?? null;
          break;
        default:
          messageDescriptor = null;
          break;
      }
      // The field exists so it's a valid segment.
      return true;
    });
    if (!isValid) {
      return false;
    }
  }
  return true;
}

function rangeFields(path: string, f: (field: string) => boolean): boolean {
  const fields = path.split('.');
  for (const field of fields) {
    if (!f(field)) {
      return false;
    }
  }
  return true;
}
