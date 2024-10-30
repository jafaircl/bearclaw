/* eslint-disable @typescript-eslint/no-explicit-any */

import { isMap, isNil } from '@bearclaw/is';
import { dequal } from 'dequal';
import { objectToMap } from '../common/utils';

export class ResolvedValue<T> {
  public static readonly NULL_VALUE = new ResolvedValue(null, true);
  public static readonly ABSENT = new ResolvedValue(null, false);

  constructor(public readonly value: T, public readonly present: boolean) {}

  equals(other: ResolvedValue<T>): boolean {
    return dequal(this, other);
  }
}

export abstract class Activation {
  abstract resolveName<T>(name: string): ResolvedValue<T> | null;
}

export class MapActivation implements Activation {
  #bindings: Map<string, any>;

  constructor(bindings: Map<string, any> | Record<string, any>) {
    this.#bindings = isMap<string, any>(bindings)
      ? bindings
      : objectToMap(bindings);
  }

  public resolveName<T>(name: string): ResolvedValue<T> {
    if (!this.#bindings.has(name)) {
      return ResolvedValue.ABSENT as ResolvedValue<T>;
    }
    const obj: T = this.#bindings.get(name);
    if (isNil(obj)) {
      return ResolvedValue.NULL_VALUE as ResolvedValue<T>;
    }
    return new ResolvedValue(obj, true);
  }
}
