import { isFunction, Primitive } from '@bearclaw/is';
import { defaultHash } from './defaultHash';
import { HashFn } from './types';

export class HashSet<T> implements Set<T> {
  private _map = new Map<Primitive, T>();
  private _hasherFn = defaultHash;

  constructor(values?: readonly T[], hasherFn?: HashFn) {
    if (isFunction(hasherFn)) {
      this._hasherFn = hasherFn;
    }
    if (values) {
      for (const value of values) {
        const key = this._hasherFn(value);
        this._map.set(key, value);
      }
    }
  }

  /**
   * Returns the number of elements in the HashSet
   */
  get size(): number {
    return this._map.size;
  }

  /**
   * Returns the toStringTag of the class
   */
  get [Symbol.toStringTag](): string {
    return 'HashSet';
  }

  /**
   * Add a value to the HashSet
   *
   * @param value the value to add
   * @returns the HashSet instance
   */
  add(value: T): this {
    const key = this._hasherFn(value);
    this._map.set(key, value);
    return this;
  }

  /**
   * Clear all values from the HashSet
   */
  clear(): void {
    this._map.clear();
  }

  /**
   * Delete a value from the HashSet
   *
   * @param value the value to delete
   * @returns a boolean indicating whether or not the value was removed
   */
  delete(value: T): boolean {
    const key = this._hasherFn(value);
    return this._map.delete(key);
  }

  /**
   * Apply a callback function to each value in the HashSet
   *
   * @param callbackfn the callback function to apply
   * @param thisArg the value to use as "this"
   */
  forEach(
    callbackfn: (value: T, value2: T, set: Set<T>) => void,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    thisArg?: any
  ): void {
    for (const value of this._map.values()) {
      callbackfn.bind(thisArg, value, value, this);
    }
  }

  /**
   * Check if the HashSet has a value
   *
   * @param value the value to check fo
   * @returns a boolean indicating whether the HashSet has the value
   */
  has(value: T): boolean {
    const key = this._hasherFn(value);
    return this._map.has(key);
  }

  /**
   * An iterable of [value, value] pairs of the values in the HashSet
   */
  *entries(): IterableIterator<[T, T]> {
    for (const value of this._map.values()) {
      yield [value, value];
    }
  }

  /**
   * An iterable of the keys in the HashSet
   */
  keys(): IterableIterator<T> {
    return this._map.values();
  }

  /**
   * An iterable of the values in the HashSet
   */
  values(): IterableIterator<T> {
    return this._map.values();
  }

  /**
   * The default iterator for the HashSet
   */
  [Symbol.iterator](): IterableIterator<T> {
    return this._map.values();
  }
}
