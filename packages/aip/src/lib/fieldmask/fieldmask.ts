import { create } from '@bufbuild/protobuf';
import { FieldMask, FieldMaskSchema } from '@bufbuild/protobuf/wkt';

/**
 * Helper function to create a field mask message.
 *
 * @param paths the field mask paths
 * @returns a field mask message
 */
export function fieldMask(paths: string[]) {
  return create(FieldMaskSchema, { paths });
}

/**
 * Helper function to check if a field mask is empty.
 *
 * @param fieldMask the field mask to check
 * @returns whether the field mask is empty
 */
export function fieldMaskIsEmpty(fieldMask: FieldMask) {
  return fieldMask.paths.length === 0;
}

/**
 * Checks if a field mask contains a specific path. Wildcards are
 * considered to match any path.
 *
 * @param fieldMask the field mask to check
 * @param path the path to check
 * @returns whether the field mask contains the specified path
 */
export function fieldMaskHasPath(fieldMask: FieldMask, path: string) {
  for (const p of fieldMask.paths) {
    if (p === '*' || p === path) {
      return true;
    }
  }
  return false;
}
