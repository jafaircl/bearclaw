/* eslint-disable @typescript-eslint/no-explicit-any */

import { isFunction, isMap, isNil, isPlainObject } from '@bearclaw/is';
import { objectToMap } from '../common/utils';
import { ResolvedValue } from './resolved-value';

/**
 * Activation used to resolve identifiers by name and references by id.
 *
 * An Activation is the primary mechanism by which a caller supplies input
 * into a CEL program.
 */
export interface Activation {
  /**
   * ResolveName returns a value from the activation by qualified name, or
   * false if the name could not be found.
   */
  resolveName<T>(name: string): ResolvedValue<T>;

  /**
   * Parent returns the parent of the current activation, may be nil. If
   * non-nil, the parent will be searched during resolve calls.
   */
  parent(): Activation | null;
}

/**
 * mapActivation which implements Activation and maps of named values.
 *
 * Named bindings may lazily supply values by providing a function which
 * accepts no arguments and produces an interface value.
 */
export class MapActivation implements Activation {
  #bindings: Map<string, any>;

  constructor(bindings: Map<string, any> | Record<string, any> = new Map()) {
    this.#bindings = isMap<string, any>(bindings)
      ? bindings
      : objectToMap(bindings);
  }

  public resolveName<T>(name: string): ResolvedValue<T> {
    if (!this.#bindings.has(name)) {
      return ResolvedValue.ABSENT as ResolvedValue<T>;
    }
    let obj: T = this.#bindings.get(name);
    if (isNil(obj)) {
      return ResolvedValue.NULL_VALUE as ResolvedValue<T>;
    }
    if (isFunction(obj)) {
      obj = obj();
      this.#bindings.set(name, obj);
    }
    return new ResolvedValue(obj, true);
  }

  public parent(): Activation | null {
    return null;
  }
}

/**
 * HierarchicalActivation which implements Activation and contains a parent and
 * child activation.
 */
export class HierarchicalActivation implements Activation {
  #parent: Activation;
  #child: Activation;

  constructor(parent: Activation, child: Activation) {
    this.#parent = parent;
    this.#child = child;
  }

  public resolveName<T>(name: string): ResolvedValue<T> {
    const value = this.#child.resolveName<T>(name);
    if (!isNil(value) && value.present === true) {
      return value;
    }
    return this.#parent.resolveName<T>(name);
  }

  public parent(): Activation | null {
    return this.#parent;
  }
}

/**
 * NewActivation returns an activation based on a map-based binding where the
 * map keys are expected to be qualified names used with ResolveName calls.
 *
 * The input `bindings` may either be of type `Activation` or
 * `map[stringinterface{}`.
 *
 * Lazy bindings may be supplied within the map-based input in either of the
 * following forms:
 *   - func() interface{}
 *   - func() ref.Val
 *
 * The output of the lazy binding will overwrite the variable reference in the
 * internal map.
 *
 * Values which are not represented as ref.Val types on input may be adapted to
 * a ref.Val using the ref.TypeAdapter configured in the environment.
 */
export function newActivation(bindings: any) {
  if (isNil(bindings)) {
    throw new Error('bindings must be non-nil');
  }
  if (
    bindings instanceof MapActivation ||
    bindings instanceof HierarchicalActivation
  ) {
    return bindings;
  }
  if (bindings instanceof Map || isPlainObject(bindings)) {
    return new MapActivation(bindings);
  }
  throw new Error(
    `activation input must be an activation or map[string]interface: got ${typeof bindings}`
  );
}

/**
 * EmptyActivation returns a variable free activation.
 */
export function emptyActivation() {
  return newActivation(new Map<string, any>());
}
