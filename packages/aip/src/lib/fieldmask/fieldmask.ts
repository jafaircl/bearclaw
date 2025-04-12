import { create } from '@bufbuild/protobuf';
import { FieldMaskSchema } from '@bufbuild/protobuf/wkt';

/**
 * Helper function to create a field mask message.
 *
 * @param paths the field mask paths
 * @returns a field mask message
 */
export function fieldMask(paths: string[]) {
  return create(FieldMaskSchema, { paths });
}
