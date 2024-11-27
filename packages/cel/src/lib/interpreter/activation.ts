/* eslint-disable @typescript-eslint/no-explicit-any */

import { isFunction, isMap, isNil } from '@bearclaw/is';
import { objectToMap } from '../common/utils';
import { AttributePattern } from './attribute-patterns';

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
  resolveName<T = any>(name: string): T | null;

  /**
   * Parent returns the parent of the current activation, may be nil. If
   * non-nil, the parent will be searched during resolve calls.
   */
  parent(): Activation | null;
}

/**
 * EmptyActivation returns a variable-free activation.
 */
export class EmptyActivation implements Activation {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  resolveName(name: string): null {
    return null;
  }

  parent() {
    return null;
  }
}

/**
 * mapActivation which implements Activation and maps of named values.
 *
 * Named bindings may lazily supply values by providing a function which
 * accepts no arguments and produces an interface value.
 */
export class MapActivation implements Activation {
  #bindings: Map<any, any>;

  constructor(bindings: Map<any, any> | Record<any, any> = new Map()) {
    this.#bindings = isMap(bindings) ? bindings : objectToMap(bindings);
  }

  resolveName<T = any>(name: string): T | null {
    if (!this.#bindings.has(name)) {
      return null;
    }
    let obj = this.#bindings.get(name);
    if (isNil(obj)) {
      return null;
    }
    if (isFunction(obj)) {
      obj = obj();
      this.#bindings.set(name, obj);
    }
    return obj;
  }

  parent() {
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

  resolveName<T = any>(name: string): T | null {
    const value = this.#child.resolveName(name);
    if (!isNil(value)) {
      return value;
    }
    return this.#parent.resolveName(name);
  }

  parent() {
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
export function newActivation(bindings: Map<string, any> | Activation) {
  if (isNil(bindings)) {
    throw new Error('bindings must be non-nil');
  }
  if (
    bindings instanceof MapActivation ||
    bindings instanceof HierarchicalActivation
  ) {
    return bindings;
  }
  if (isMap<string, any>(bindings)) {
    return new MapActivation(bindings);
  }
  throw new Error(
    `activation input must be an activation or map[string]interface: got ${typeof bindings}`
  );
}

/**
 * PartialActivation extends the Activation interface with a set of
 * UnknownAttributePatterns.
 */
export class PartialActivation implements Activation {
  private _activation: Activation;
  private _unknowns: AttributePattern[];

  constructor(activation: Activation, ...unknowns: AttributePattern[]) {
    this._activation = activation;
    this._unknowns = unknowns ?? [];
  }

  resolveName<T = any>(name: string): T | null {
    return this._activation.resolveName(name);
  }

  parent() {
    return this._activation.parent();
  }

  /**
   * UnknownAttributePatterns returns a set of AttributePattern values which
   * match Attribute expressions for data accesses whose values are not yet
   * known.
   */
  unknownAttributePatterns() {
    return this._unknowns;
  }
}
