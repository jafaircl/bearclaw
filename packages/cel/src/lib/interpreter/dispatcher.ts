import { Overload } from '../common/functions';

/**
 * Dispatcher resolves function calls to their appropriate overload.
 */
export class Dispatcher {
  #parent: Dispatcher | null = null;
  #overloads: Map<string, Overload> = new Map();

  /**
   * Add one or more overloads, returning an error if any Overload has the
   * same name.
   *
   * @param overloads the overloads to add
   */
  add(...overloads: Overload[]) {
    for (let i = 0; i < overloads.length; i++) {
      const overload = overloads[i];
      if (this.#overloads.has(overload.operator)) {
        throw new Error(`Overload ${overload.operator} already exists`);
      }
      this.#overloads.set(overload.operator, overload);
    }
  }

  /**
   * Returns an Overload definition matching the provided name.
   *
   * @param overload the name of the overload to find
   * @returns the Overload definition or null if not found
   */
  findOverload(overload: string): Overload | null {
    return this.#overloads.get(overload) || null;
  }

  /**
   * Returns the set of all overload identifiers configured for dispatch.
   *
   * @returns the set of overload identifiers
   */
  overloadIds(): string[] {
    const overloadIds = [];
    for (const overload of this.#overloads.values()) {
      overloadIds.push(overload.operator);
    }
    return overloadIds;
  }
}
