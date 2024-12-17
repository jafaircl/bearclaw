/* eslint-disable @typescript-eslint/no-explicit-any */
import { isFunction } from '@bearclaw/is';
import { DescEnum, DescMessage } from '@bufbuild/protobuf';
import { RefType, RefVal } from '../ref/reference';
import { isType, Type } from '../types/types';

/**
 * Adapter converts native TS values of varying type and complexity to
 * equivalent CEL values.
 */
export interface Adapter {
  /**
   * NativeToValue converts the input `value` to a CEL `Value`.
   */
  nativeToValue(value: any): RefVal;
}

export function isAdapter(value: any): value is Adapter {
  return value && isFunction(value['nativeToValue']);
}

/**
 * Provider specifies functions for creating new object instances and for
 * resolving enum values by name
 */
export interface Provider {
  /**
   * EnumValue returns the numeric value of the given enum value name.
   */
  enumValue(enumName: string): RefVal;

  /**
   * FindIdent takes a qualified identifier name and returns a ref.Val if one
   * exists.
   */
  findIdent(ident: string): RefVal | null;

  /**
   * FindStructProtoType returns the protobuf message descriptor for the given
   * type name.
   */
  findStructProtoType(typeName: string): DescMessage | null;

  /**
   * FindStructType returns the Type give a qualified type name.
   *
   * For historical reasons, only struct types are expected to be returned
   * through this method, and the type values are expected to be wrapped in a
   * TypeType instance using typeTypeWithParam(<structType>).
   *
   * Returns null if not found.
   */
  findStructType(typeName: string): Type | null;

  /**
   * FindStructFieldNames returns the field names associated with the type, if
   * the type is found.
   */
  findStructFieldNames(typeName: string): string[];

  /**
   * FieldStructFieldType returns the field type for a checked type value.
   * Returns null if the field could not be found.
   */
  findStructFieldType(typeName: string, fieldName: string): FieldType | null;

  /**
   * NewValue creates a new type value from a qualified name and map of field
   * name to value.
   *
   * Note, for each value, the Val.ConvertToNative function will be invoked to
   * convert the Val to the field's native type. If an error occurs during
   * conversion, the NewValue will be a types.Err.
   */
  newValue(typeName: string, fields: Map<string, RefVal>): RefVal;
}

export function isProvider(value: any): value is Provider {
  return (
    value &&
    isFunction(value['enumValue']) &&
    isFunction(value['findIdent']) &&
    isFunction(value['findStructType']) &&
    isFunction(value['findStructFieldNames']) &&
    isFunction(value['findStructFieldType']) &&
    isFunction(value['newValue'])
  );
}

/**
 * Registry provides type information for a set of registered types.
 */
export interface Registry extends Provider, Adapter {
  /**
   * Copy the TypeRegistry and return a new registry whose mutable state is
   * isolated.
   */
  copy(): Registry;

  /**
   * Register a type via a materialized object, which the provider can turn
   * into a type.
   */
  register(t: any): void;

  /**
   * RegisterType registers a type value with the provider which ensures the
   * provider is aware of how to map the type to an identifier.
   *
   * If a type is provided more than once with an alternative definition, the
   * call will result in an error.
   */
  registerType(...types: RefType[]): void;

  /**
   * RegisterDescriptor registers a protocol buffer descriptor and its
   * dependencies.
   */
  registerDescriptor(desc: DescMessage | DescEnum): void;
}

export function isRegistry(value: any): value is Registry {
  return (
    value &&
    isFunction(value['copy']) &&
    isFunction(value['register']) &&
    isFunction(value['registerType']) &&
    isProvider(value) &&
    isAdapter(value)
  );
}

/**
 * FieldType represents a field's type value and whether that field supports
 * presence detection.
 */
export class FieldType<TargetType = any, ValueType = any> {
  constructor(
    /**
     * Type of the field as a CEL native type value.
     */
    public readonly type: Type,

    /**
     * IsSet indicates whether the field is set on an input object.
     */
    public readonly isSet: FieldTester<TargetType>,

    /**
     * GetFrom retrieves the field value on the input object, if set.
     */
    public readonly getFrom: FieldGetter<TargetType, ValueType>
  ) {}
}

export function isFieldType(value: any): value is FieldType {
  return (
    value &&
    isFunction(value['isSet']) &&
    isFunction(value['getFrom']) &&
    isType(value['type'])
  );
}

/**
 * FieldTester is used to test field presence on an input object.
 */
type FieldTester<TargetType = any> = (target: TargetType) => boolean;

/**
 * FieldGetter is used to get the field value from an input object, if set.
 */
type FieldGetter<TargetType = any, ValueType = any> = (
  target: TargetType
) => ValueType;
