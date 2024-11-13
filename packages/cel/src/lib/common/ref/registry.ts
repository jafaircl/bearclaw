/* eslint-disable @typescript-eslint/no-explicit-any */
import { TypeAdapter } from './adapter';
import { TypeProvider } from './provider';
import { RefType } from './reference';

/**
 * TypeRegistry allows third-parties to add custom types to CEL. Not all
 * `TypeProvider` implementations support type-customization, so these features
 * are optional. However, a `TypeRegistry` should be a `TypeProvider` and a
 * `TypeAdapter` to ensure that types which are registered can be converted to
 * CEL representations.
 */
export interface TypeRegistry extends TypeProvider, TypeAdapter {
  /**
   * Copy the TypeRegistry and return a new registry whose mutable state is
   * isolated.
   */
  copy(): TypeRegistry;

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
}
