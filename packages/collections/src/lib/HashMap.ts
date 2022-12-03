import { isFunction, Primitive } from '@bearclaw/is';
import { defaultHash } from './defaultHash';
import { HashFn } from './types';

/**
 * A simple hash map implementation.
 */
export class HashMap<K, V> implements Map<K, V> {
  private _keyMap = new Map<Primitive, K>();
  private _valueMap = new Map<Primitive, V>();
  private _hasherFn = defaultHash;

  /**
   * Build a new hash map from an iterable of key-value pairs
   *
   * @param entries the entries to add to the HashMap
   * @param hasherFn the hashing function to use
   */
  constructor(entries?: readonly (readonly [K, V])[], hasherFn?: HashFn) {
    if (isFunction(hasherFn)) {
      this._hasherFn = hasherFn;
    }
    if (entries) {
      for (const [key, value] of entries) {
        this.set(key, value);
      }
    }
  }

  /**
   * Returns the number of elements in the HashMap
   */
  get size(): number {
    return this._keyMap.size;
  }

  /**
   * Returns the toStringTag of the class
   */
  get [Symbol.toStringTag](): string {
    return 'HashMap';
  }

  /**
   * Clear all values in the HashMap
   */
  clear(): void {
    this._keyMap.clear();
    this._valueMap.clear();
  }

  /**
   * Delete a key-value pair from the HashMap
   *
   * @param key the key to delete
   * @returns a boolean indicating whether the operation was successful
   */
  delete(key: K): boolean {
    const hashedKey = this._hasherFn(key);
    return this._keyMap.delete(hashedKey) && this._valueMap.delete(hashedKey);
  }

  /**
   * Apply a callback function to each key-value pair in the HashMap
   *
   * @param callbackfn the callback function to apply
   * @param thisArg the value to use as "this"
   */
  forEach(
    callbackfn: (value: V, key: K, map: this) => void,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    thisArg?: any
  ): void {
    for (const [key, value] of this.entries()) {
      callbackfn.bind(thisArg, value, key, this);
    }
  }

  /**
   * Get the value for a key in the HashMap
   *
   * @param key the key to get the value for
   * @returns the value corresponding to the key (or undefined)
   */
  get(key: K): V {
    const hashedKey = this._hasherFn(key);
    return this._valueMap.get(hashedKey);
  }

  /**
   * Check that the HashMap has a key
   *
   * @param key the key to check for
   * @returns a boolean indicating whether the HashMap has the key
   */
  has(key: K): boolean {
    const hashedKey = this._hasherFn(key);
    return this._keyMap.has(hashedKey) && this._valueMap.has(hashedKey);
  }

  /**
   * Set a key-value pair in the HashMap
   *
   * @param key the key to set
   * @param value the value to set
   * @returns the HashMap instance
   */
  set(key: K, value: V): this {
    const hashedKey = this._hasherFn(key);
    this._keyMap.set(hashedKey, key);
    this._valueMap.set(hashedKey, value);
    return this;
  }

  /**
   * An iterable of [key, value] pairs of the key-value pairs in the HashMap
   */
  *entries(): IterableIterator<[K, V]> {
    for (const [hashedKey, key] of this._keyMap.entries()) {
      yield [key, this._valueMap.get(hashedKey)];
    }
  }

  /**
   * An iterable of the keys in the HashMap
   */
  keys(): IterableIterator<K> {
    return this._keyMap.values();
  }

  /**
   * An iterable of the values in the HashMap
   */
  values(): IterableIterator<V> {
    return this._valueMap.values();
  }

  /**
   * The default iterator for the HashMap
   */
  [Symbol.iterator](): IterableIterator<[K, V]> {
    return this.entries();
  }
}
