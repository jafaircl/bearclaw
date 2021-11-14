import { defaultHash } from './defaultHash';
import { HashFn, Primitive } from './types';

export class HashMap<K, V> implements Map<K, V> {
  private _keyMap = new Map<Primitive, K>();
  private _valueMap = new Map<Primitive, V>();
  private _hasherFn = defaultHash;

  constructor(entries?: readonly (readonly [K, V])[], hasherFn?: HashFn) {
    if (hasherFn) {
      this._hasherFn = hasherFn;
    }
    if (entries) {
      for (const [key, value] of entries) {
        this.set(key, value);
      }
    }
  }

  clear(): void {
    this._keyMap.clear();
    this._valueMap.clear();
  }

  delete(key: K): boolean {
    const hashedKey = this._hasherFn(key);
    return this._keyMap.delete(hashedKey) && this._valueMap.delete(hashedKey);
  }

  forEach(
    callbackfn: (value: V, key: K, map: this) => void,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    thisArg?: any
  ): void {
    for (const [key, value] of this.entries()) {
      callbackfn.bind(thisArg, value, key, this);
    }
  }

  get(key: K): V {
    const hashedKey = this._hasherFn(key);
    return this._valueMap.get(hashedKey);
  }

  has(key: K): boolean {
    const hashedKey = this._hasherFn(key);
    return this._keyMap.has(hashedKey) && this._valueMap.has(hashedKey);
  }

  set(key: K, value: V): this {
    const hashedKey = this._hasherFn(key);
    this._keyMap.set(hashedKey, key);
    this._valueMap.set(hashedKey, value);
    return this;
  }

  get size(): number {
    return this._keyMap.size;
  }

  *entries(): IterableIterator<[K, V]> {
    for (const [hashedKey, key] of this._keyMap.entries()) {
      yield [key, this._valueMap.get(hashedKey)];
    }
  }

  keys(): IterableIterator<K> {
    return this._keyMap.values();
  }

  values(): IterableIterator<V> {
    return this._valueMap.values();
  }

  [Symbol.iterator](): IterableIterator<[K, V]> {
    return this.entries();
  }

  get [Symbol.toStringTag](): string {
    return 'HashMap';
  }
}
