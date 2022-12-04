import {
  defer,
  distinctUntilChanged,
  map,
  merge,
  Observable,
  of,
  Subject,
} from 'rxjs';

/**
 * A map that emits events when the map changes.
 */
export class ObservableMap<K, V> extends Map<K, V> {
  private readonly _subject = new Subject<ObservableMap<K, V>>();

  /**
   * Build a new ObservableMap from an iterable of key-value pairs
   *
   * @param entries an iterable of key-value pairs
   */
  constructor(entries?: readonly (readonly [K, V])[]) {
    super(entries);
    this._subject.next(this);
  }

  /**
   * A String value that is used in the creation of the default string
   * description of an object. Called by the built-in method
   * `Object.prototype.toString`.
   */
  get [Symbol.toStringTag](): string {
    return 'ObservableMap';
  }

  // Observable getters

  /**
   * Observe the size of the map.
   *
   * This will emit the current size of the map, and then emit again whenever
   * the size changes.
   *
   * @example
   * ```typescript
   * const map = new ObservableMap();
   * map.set('foo', 'bar');
   * map.size$.subscribe((size) => console.log(size)); // 1
   * ```
   */
  get size$(): Observable<number> {
    return this.asObservable().pipe(
      map((_map) => _map.size),
      distinctUntilChanged()
    );
  }

  // Overrides for all mutating methods

  /**
   * Adds a new element with a specified key and value to the Map. If an
   * element with the same key already exists, the element will be updated.
   *
   * @param key the key to set
   * @param value the value to set
   * @returns the map instance
   */
  override set(key: K, value: V): this {
    super.set(key, value);
    this._subject?.next(this);
    return this;
  }

  /**
   * Delete a key-value pair from the map.
   *
   * @param key the key to delete
   * @returns a boolean indicating whether the operation was successful
   */
  override delete(key: K): boolean {
    const deleted = super.delete(key);
    this._subject.next(this);
    return deleted;
  }

  /**
   * Clear all key-value pairs from the map.
   */
  override clear(): void {
    super.clear();
    this._subject.next(this);
  }

  // Observable methods

  /**
   * Observe whether the map has a key.
   *
   * This will emit whether the map has the key, and then emit whenever the map
   * changes.
   *
   * @example
   * ```typescript
   * const map = new ObservableMap();
   * map.set('foo', 'bar');
   * map.has$('foo').subscribe((has) => console.log(has)); // true
   * map.has$('lorem').subscribe((has) => console.log(has)); // false
   * ```
   *
   * @param key the key to observe
   * @returns an Observable of booleans indicating whether the map has the key
   */
  has$(key: K): Observable<boolean> {
    return this.asObservable().pipe(
      map((_map) => _map.has(key)),
      distinctUntilChanged()
    );
  }

  /**
   * Observes the value of a key in the map.
   *
   * This will emit the current value of the key in the map, and then emit
   * whenever the map changes.
   *
   * @example
   * ```typescript
   * const map = new ObservableMap();
   * map.set('foo', 'bar');
   * map.get$('foo').subscribe((value) => console.log(value)); // 'bar'
   * ```
   *
   * @param key the key to observe
   * @returns an Observable of the value for the key
   */
  get$(key: K): Observable<V> {
    return this.asObservable().pipe(
      map((_map) => _map.get(key)),
      distinctUntilChanged()
    );
  }

  /**
   * Observes the entries in the map.
   *
   * This will emit the current entries in the map, and then emit whenever the
   * map changes.
   *
   * As the value of `map.entries()` will be a new iterator each time, this will
   * not use `distinctUntilChanged`.
   *
   * @example
   * ```typescript
   * const map = new ObservableMap();
   * map.set('foo', 'bar');
   * map.entries$().subscribe((entries) => console.log(entries));
   * // [['foo', 'bar']]
   * ```
   *
   * @returns an Observable of the entries in the map
   */
  entries$(): Observable<IterableIterator<[K, V]>> {
    return this.asObservable().pipe(map((_map) => _map.entries()));
  }

  /**
   * Observes the keys in the map.
   *
   * This will emit the current keys in the map, and then emit whenever the map
   * changes.
   *
   * As the value of `map.keys()` will be a new iterator each time, this will
   * not use `distinctUntilChanged`.
   *
   * @example
   * ```typescript
   * const map = new ObservableMap();
   * map.set('foo', 'bar');
   * map.keys$().subscribe((keys) => console.log(keys)); // ['foo']
   * ```
   *
   * @returns an Observable of the keys in the map
   */
  keys$(): Observable<IterableIterator<K>> {
    return this.asObservable().pipe(map((_map) => _map.keys()));
  }

  /**
   * Observes the values in the map.
   *
   * This will emit the current values in the map, and then emit whenever the
   * map changes.
   *
   * As the value of `map.values()` will be a new iterator each time, this will
   * not use `distinctUntilChanged`.
   *
   * @example
   * ```typescript
   * const map = new ObservableMap();
   * map.set('foo', 'bar');
   * map.values$().subscribe((values) => console.log(values)); // ['bar']
   * ```
   *
   * @returns an Observable of the values in the map
   */
  values$(): Observable<IterableIterator<V>> {
    return this.asObservable().pipe(map((_map) => _map.values()));
  }

  /**
   * This will complete the underlying Subject, which will prevent any further
   * emissions from the ObservableMap methods.
   *
   * This is useful if you want to prevent memory leaks when you no longer need
   * to observe the map.
   *
   * This will not clear the map.
   *
   * This will not unsubscribe any Observables returned from the ObservableMap
   * methods.
   *
   * @example
   * ```typescript
   * const map = new ObservableMap();
   * map.set('foo', 'bar');
   * const subscription = map.size$.subscribe((size) => console.log(size));
   * map.complete();
   * ```
   */
  complete() {
    this._subject.complete();
  }

  /**
   * Get the value of the map as an Observable.
   *
   * This will emit the current value of the map, and then emit again whenever
   * the map changes.
   *
   * @example
   * ```typescript
   * const map = new ObservableMap();
   * map.set('foo', 'bar');
   * map.asObservable().subscribe((map) => console.log(map));
   * // ObservableMap { 'foo' => 'bar' }
   * ```
   *
   * @returns an Observable that emits the map whenever it changes
   */
  asObservable(): Observable<ObservableMap<K, V>> {
    return merge(
      defer(() => of(this)),
      this._subject.asObservable()
    );
  }
}
