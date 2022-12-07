import { isNil } from '@bearclaw/is';
import { Observer, Subject, Subscription } from 'rxjs';

/**
 * A constructor for a Map-like class. This is useful for cases where you want
 * to use a custom Map implementation with MapSubject.
 */
export type MapLikeCtor<K, V> = new (
  values?: readonly (readonly [K, V])[]
) => Map<K, V>;

/**
 * A Subject that emits a Map but also implements a Map-like interface. This is
 * useful for cases where you want to expose a Map-like interface, but also
 * want to be able to emit the Map as an Observable.
 */
export class MapSubject<K, V> extends Subject<Map<K, V>> {
  /**
   * The underlying Map that is being emitted.
   */
  private _map: Map<K, V>;

  /**
   * Build a new MapSubject from an array of key-value pairs
   *
   * @example
   * ```typescript
   * const map = new MapSubject([['foo', 'bar']]);
   * map.subscribe((map) => console.log(map)); // Map(1) { 'foo' => 'bar' }
   * ```
   *
   * @param values the key-value pairs to use as the initial value
   */
  constructor(
    values?: readonly (readonly [K, V])[],
    private mapCtor: MapLikeCtor<K, V> = Map
  ) {
    super();
    this.next(new this.mapCtor(values));
  }

  /**
   * Emit a new Map value. This will overwrite the current Map value. If you
   * want to add to the current Map, use the `set` method. If you want to
   * remove from the current Map, use the `delete` method. If you want to
   * clear the current Map, use the `clear` method.
   *
   * If no value is provided, the current Map will be emitted. This is useful
   * for cases where you want to force a re-emit of the current Map.
   *
   * @example
   * ```typescript
   * const map = new MapSubject([['foo', 'bar']]);
   * map.subscribe((map) => console.log(map)); // Map(1) { 'foo' => 'bar' }
   * map.next(new Map([['baz', 'qux']]));
   * map.subscribe((map) => console.log(map)); // Map(1) { 'baz' => 'qux' }
   * map.next();
   * map.subscribe((map) => console.log(map)); // Map(1) { 'baz' => 'qux' }
   * ```
   *
   * @param value the Map to emit
   */
  override next(value?: Map<K, V>): void {
    if (isNil(value)) {
      return super.next(new this.mapCtor([...this._map]));
    }
    this._map = new this.mapCtor([...value]);
    return super.next(this._map);
  }

  /**
   * Subscribe to the MapSubject. This will emit the current Map value, and then
   * emit again whenever the Map value changes. If you only want to subscribe to
   * changes, use the `asObservable` method.
   *
   * Note that calling a mutation method on the emitted Map will not cause the
   * MapSubject to emit again. You must call the corresponding method on the
   * MapSubject to cause it to emit again. For example, if you call `set` on the
   * emitted Map, the MapSubject will not emit again. You must call `set` on the
   * MapSubject to cause it to emit again. This is to prevent infinite loops.
   *
   * @example
   * ```typescript
   * const map = new MapSubject([['foo', 'bar']]);
   * map.subscribe((map) => console.log(map)); // Map(1) { 'foo' => 'bar' }
   * ```
   *
   * @param observer the observer or a next function
   * @returns a Subscription
   */
  override subscribe(observer?: Partial<Observer<Map<K, V>>>): Subscription;
  override subscribe(next?: (value: Map<K, V>) => void): Subscription;
  override subscribe(
    observerOrNext?: Partial<Observer<Map<K, V>>> | ((value: Map<K, V>) => void)
  ): Subscription {
    const subscription = super.subscribe(
      observerOrNext as Partial<Observer<Map<K, V>>>
    );
    !subscription.closed && this.next();
    return subscription;
  }

  // Mutation methods

  /**
   * Add a new key/value pair to the Map. This will emit the new Map value.
   * If the key already exists, the value will be overwritten.
   *
   * @returns the MapSubject
   * @example
   * ```typescript
   * const map = new MapSubject([['foo', 'bar']]);
   * map.subscribe((map) => console.log(map)); // Map(1) { 'foo' => 'bar' }
   * map.set('baz', 'qux');
   * map.subscribe((map) => console.log(map));
   * // Map(2) { 'foo' => 'bar', 'baz' => 'qux' }
   * ```
   *
   * @param key the key
   * @param value the value
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/set}
   * @see {@link https://rxjs.dev/api/index/class/Subject#next}
   */
  set(key: K, value: V): void {
    this._map.set(key, value);
    this.next();
  }

  /**
   * Remove a key/value pair from the Map. This will emit the new Map value.
   *
   * @example
   * ```typescript
   * const map = new MapSubject([['foo', 'bar']]);
   * map.subscribe((map) => console.log(map)); // Map(1) { 'foo' => 'bar' }
   * map.delete('foo');
   * map.subscribe((map) => console.log(map)); // Map(0) {}
   * ```
   *
   * @param key the key
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/delete}
   * @see {@link https://rxjs.dev/api/index/class/Subject#next}
   */
  delete(key: K): void {
    const deleted = this._map.delete(key);
    if (deleted) {
      this.next();
    }
  }

  /**
   * Remove all key/value pairs from the Map. This will emit the new Map value.
   *
   * @example
   * ```typescript
   * const map = new MapSubject([['foo', 'bar']]);
   * map.subscribe((map) => console.log(map)); // Map(1) { 'foo' => 'bar' }
   * map.clear();
   * map.subscribe((map) => console.log(map)); // Map(0) {}
   * ```
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/clear}
   * @see {@link https://rxjs.dev/api/index/class/Subject#next}
   */
  clear(): void {
    this._map.clear();
    this.next();
  }

  // Read methods

  /**
   * The iterator for the underlying Map. This is useful for cases where you
   * want to iterate over the underlying Map's entries. For example, you can
   * use the spread operator to convert the MapSubject's entries to an array.
   *
   * @example
   * ```typescript
   * const map = new MapSubject([['foo', 'bar']]);
   * const entries = [...map];
   * console.log(entries); // [ ['foo', 'bar'] ]
   * ```
   *
   * @returns an iterator for the underlying Map
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/entries}
   */
  [Symbol.iterator](): IterableIterator<[K, V]> {
    return this._map[Symbol.iterator]();
  }

  /**
   * The size of the underlying Map.
   *
   * @example
   * ```typescript
   * const map = new MapSubject([['foo', 'bar']]);
   * console.log(map.size); // 1
   * ```
   *
   * @returns the size of the Map
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/size}
   */
  get size(): number {
    return this._map.size;
  }

  /**
   * Check whether the Map has a value associated with the provided key.
   *
   * @example
   * ```typescript
   * const map = new MapSubject([['foo', 'bar']]);
   * console.log(map.has('foo')); // true
   * console.log(map.has('baz')); // false
   *
   * @returns a boolean indicating whether the Map has a value for the key
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/has}
   */
  has(key: K): boolean {
    return this._map.has(key);
  }

  /**
   * Get the value associated with the provided key.
   *
   * @example
   * ```typescript
   * const map = new MapSubject([['foo', 'bar']]);
   * console.log(map.get('foo')); // 'bar'
   * console.log(map.get('baz')); // undefined
   * ```
   *
   * @returns the value associated with the key, or undefined if the key does not exist
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/get}
   */
  get(key: K): V {
    return this._map.get(key);
  }

  /**
   * The iterator for the underlying Map's entries. This is useful for cases
   * where you want to iterate over the underlying Map's entries. For example,
   * you can use the spread operator to convert the MapSubject's entries to an
   * array.
   *
   * @example
   * ```typescript
   * const map = new MapSubject([['foo', 'bar']]);
   * const entries = [...map.entries()];
   * console.log(entries); // [ ['foo', 'bar'] ]
   * ```
   *
   * @returns an iterator for the underlying Map's entries
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/entries}
   */
  entries(): IterableIterator<[K, V]> {
    return this._map.entries();
  }

  /**
   * The iterator for the underlying Map's keys. This is useful for cases where
   * you want to iterate over the underlying Map's keys. For example, you can
   * use the spread operator to convert the MapSubject's keys to an array.
   *
   * @example
   * ```typescript
   * const map = new MapSubject([['foo', 'bar']]);
   * const keys = [...map.keys()];
   * console.log(keys); // [ 'foo' ]
   * ```
   *
   * @returns an iterator for the underlying Map's keys
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/keys}
   */
  keys(): IterableIterator<K> {
    return this._map.keys();
  }

  /**
   * The iterator for the underlying Map's values. This is useful for cases
   * where you want to iterate over the underlying Map's values. For example,
   * you can use the spread operator to convert the MapSubject's values to an
   * array.
   *
   * @example
   * ```typescript
   * const map = new MapSubject([['foo', 'bar']]);
   * const values = [...map.values()];
   * console.log(values); // [ 'bar' ]
   * ```
   *
   * @returns an iterator for the underlying Map's values
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/values}
   */
  values(): IterableIterator<V> {
    return this._map.values();
  }
}
