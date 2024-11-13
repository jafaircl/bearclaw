import { Type } from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb.js';
import { FieldType } from './field-type';
import { RefVal } from './reference';

/**
 * TypeProvider specifies functions for creating new object instances and for
 * resolving enum values by name.
 */
export interface TypeProvider {
  /**
   * EnumValue returns the numeric value of the given enum value name.
   */
  enumValue(enumName: string): RefVal;

  /**
   * FindIdent takes a qualified identifier name and returns a Value if one
   * exists.
   */
  findIdent(identName: string): RefVal;

  /**
   * FindType looks up the Type given a qualified typeName. Returns null if
   * not found.
   *
   * Used during type-checking only.
   */
  findType(typeName: string): Type | null;

  /**
   * FieldFieldType returns the field type for a checked type value. Returns
   * null if the field could not be found.
   *
   * <p>Used during type-checking only.
   */
  findFieldType(messageType: string, fieldName: string): FieldType | Error;

  /**
   * NewValue creates a new type value from a qualified name and map of field
   * name to value.
   *
   * Note, for each value, the Val.ConvertToNative function will be invoked to
   * convert the Val to the field's native type. If an error occurs during
   * conversion, the NewValue will be an Error.
   */
  newValue(typeName: string, fields: Record<string, RefVal>): RefVal;
}
