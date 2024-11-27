import { isNil } from '@bearclaw/is';
import { Overload } from '../common/functions';

/**
 * Dispatcher resolves function calls to their appropriate overload.
 */
export interface Dispatcher {
  /**
   * Add one or more overloads, returning an error if any Overload has the same
   * Overload#Name.
   */
  add(...overloads: Overload[]): Error | null;

  /**
   * FindOverload returns an Overload definition matching the provided name.
   */
  findOverload(overload: string): Overload | null;

  /**
   * OverloadIds returns the set of all overload identifiers configured for
   * dispatch.
   */
  overloadIds(): string[];
}

/**
 * ExtendDispatcher returns a Dispatcher which inherits the overloads of its
 * parent, and provides an isolation layer between built-ins and extension
 * functions which is useful for forward compatibility.
 */
export function extendDispatcher(parent: Dispatcher) {
  return new DefaultDispatcher(parent);
}

/**
 * defaultDispatcher struct which contains an overload map.
 */
export class DefaultDispatcher implements Dispatcher {
  #parent?: Dispatcher;
  #overloads: Map<string, Overload> = new Map();

  constructor(parent?: Dispatcher) {
    if (!isNil(parent)) {
      this.#parent = parent;
    }
  }

  add(...overloads: Overload[]): Error | null {
    for (const overload of overloads) {
      // add the overload unless an overload of the same name has already been
      // provided.
      if (this.#overloads.has(overload.operator)) {
        return new Error(`overload already exists '${overload.operator}'`);
      }
      // index the overload by function name.
      this.#overloads.set(overload.operator, overload);
    }
    return null;
  }

  findOverload(overload: string): Overload | null {
    const o = this.#overloads.get(overload);
    if (!isNil(o)) {
      return o;
    }
    return this.#parent?.findOverload(overload) ?? null;
  }

  overloadIds(): string[] {
    const overloads = new Set([...this.#overloads.keys()]);
    for (const id of this.#parent?.overloadIds() ?? []) {
      if (!overloads.has(id)) {
        overloads.add(id);
      }
    }
    return [...overloads];
  }
}
