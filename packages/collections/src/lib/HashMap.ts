import { isFunction, Primitive } from '@bearclaw/is';
import { defaultHash } from './defaultHash';
import { HashFn } from './types';

/**
 * A simple hash map implementation. The hashing function is used to generate
 * a key for the value. If the hashing function returns the same value for two
 * different values, the second value will overwrite the first. If the hashing
 * function generates collisions for your use case, you can provide your own
 * hashing function.
 *
 * The default hashing function will sort the value if it is an object, array,
 * set or map. This will ensure that the same value will always generate the
 * same hash. If this is not desired, you can provide your own hashing function.
 *
 * @example
 * ```typescript
 * const map = new HashMap();
 * map.set({ a: 1, b: 2 }, 'value');
 * map.get({ b: 2, a: 1 }); // 'value'
 * ```
 *
 * @example
 * ```typescript
 * const map = new HashMap();
 * map.set([1, 2, 3], 'value');
 * map.get([3, 2, 1]); // 'value'
 * ```
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
