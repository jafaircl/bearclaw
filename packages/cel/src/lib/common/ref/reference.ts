/* eslint-disable @typescript-eslint/no-explicit-any */
import { isFunction } from '@bearclaw/is';
import { NativeType } from '../types/native';
import { Trait } from '../types/traits/trait';

export enum RefTypeEnum {
  BOOL = 'bool',
  BYTES = 'bytes',
  DOUBLE = 'double',
  DURATION = 'google.protobuf.Duration',
  ERR = 'error',
  INT = 'int',
  LIST = 'list',
  MAP = 'map',
  NULL = 'null_type',
  OBJECT = 'object',
  STRING = 'string',
  TIMESTAMP = 'google.protobuf.Timestamp',
  TYPE = 'type',
  UINT = 'uint',
  UNKNOWN = 'unknown',
}

/**
 * Type interface indicate the name of a given type.
 */
export interface RefType extends RefVal {
  /**
   * HasTrait returns whether the type has a given trait associated with it.
   *
   * See common/types/traits/traits.ts for a list of supported traits.
   */
  hasTrait(trait: Trait): boolean;

  /**
   * TypeName returns the qualified type name of the type.
   *
   * The type name is also used as the type's identifier name at type-check and
   * interpretation time.
   */
  typeName(): string;
}

export function isRefType(value: any): value is RefType {
  return (
    isFunction(value.hasTrait) && isFunction(value.typeName) && isRefVal(value)
  );
}

/**
 * Val interface defines the functions supported by all expression values.
 * Val implementations may specialize the behavior of the value through the
 * addition of traits.
 */
export interface RefVal {
  /**
   * ConvertToNative converts the Value to a native JS object according to the
   * reflected type description, or error if the conversion is not feasible.
   *
   * The ConvertToNative method is intended to be used to support conversion
   * between CEL types  and native types during object creation expressions or
   * by clients who need to adapt the, returned CEL value into an equivalent TS
   * value instance.
   *
   * When implementing or using ConvertToNative, the following guidelines apply:
   * - Use ConvertToNative when marshalling CEL evaluation results to native
   * types.
   * - Do not use ConvertToNative within CEL extension functions.
   * - Document whether your implementation supports non-CEL field types, such
   * as JS or Protobuf.
   *
   * Note that when converting a Timestamp to a native JS Date, nanosecond
   * precision will be lost since JS Dates only support millisecond precision.
   */
  convertToNative(type: NativeType): any;

  /**
   * ConvertToType supports type conversions between CEL value types supported
   * by the expression language.
   */
  convertToType(type: RefType): RefVal;

  /**
   * Equal returns true if the `other` value has the same type and content as
   * the implementing struct.
   */
  equal(other: RefVal): RefVal;

  /**
   * Type returns the TypeValue of the value.
   */
  type(): RefType;

  /**
   * Value returns the raw value of the instance which may not be directly
   * compatible with the expression language types.
   */
  value(): any;
}

export function isRefVal(value: any): value is RefVal {
  return (
    isFunction(value.convertToNative) &&
    isFunction(value.convertToType) &&
    isFunction(value.equal) &&
    isFunction(value.type) &&
    isFunction(value.value)
  );
}
