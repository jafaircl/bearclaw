import { defaultHash } from './defaultHash';
import { HashFn, Primitive } from './types';

export class HashSet<T> implements Set<T> {
  private _map = new Map<Primitive, T>();
  private _hasherFn = defaultHash;

  constructor(values?: readonly T[], hasherFn?: HashFn) {
    if (hasherFn) {
      this._hasherFn = hasherFn;
    }
    if (values) {
      for (const value of values) {
        const key = this._hasherFn(value);
        this._map.set(key, value);
      }
    }
  }

  add(value: T): this {
    const key = this._hasherFn(value);
    this._map.set(key, value);
    return this;
  }

  clear(): void {
    this._map.clear();
  }

  delete(value: T): boolean {
    const key = this._hasherFn(value);
    return this._map.delete(key);
  }

  forEach(
    callbackfn: (value: T, value2: T, set: Set<T>) => void,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    thisArg?: any
  ): void {
    for (const value of this._map.values()) {
      callbackfn.bind(thisArg, value, value, this);
    }
  }

  has(value: T): boolean {
    const key = this._hasherFn(value);
    return this._map.has(key);
  }

  get size(): number {
    return this._map.size;
  }

  *entries(): IterableIterator<[T, T]> {
    for (const value of this._map.values()) {
      yield [value, value];
    }
  }

  keys(): IterableIterator<T> {
    return this._map.values();
  }

  values(): IterableIterator<T> {
    return this._map.values();
  }

  [Symbol.iterator](): IterableIterator<T> {
    return this._map.values();
  }

  get [Symbol.toStringTag](): string {
    return 'HashSet';
  }
}
