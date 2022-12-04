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

  // Observable getters

  /**
   * Observe the size of the map
   */
  get size$(): Observable<number> {
    return merge(
      defer(() => of(this.size)),
      this._subject.asObservable().pipe(
        map((map) => map.size),
        distinctUntilChanged()
      )
    );
  }

  // Overrides for all mutating methods

  /**
   * Set a key-value pair in the map
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
   * Delete a key-value pair from the map
   *
   * @param key the key to delete
   * @returns a boolean indicating whether the operation was successful
   */
  override delete(key: K): boolean {
    const returnValue = super.delete(key);
    this._subject.next(this);
    return returnValue;
  }

  /**
   * Clear all key-value pairs from the map
   */
  override clear(): void {
    super.clear();
    this._subject.next(this);
  }

  // Observable methods

  /**
   * Observe whether the map has a key
   *
   * @param key the key to observe
   * @returns an Observable of booleans indicating whether the map has the key
   */
  has$(key: K): Observable<boolean> {
    return merge(
      defer(() => of(this.has(key))),
      this._subject.asObservable().pipe(
        map((map) => map.has(key)),
        distinctUntilChanged()
      )
    );
  }

  /**
   * Observes the value of a key in the map
   *
   * @param key the key to observe
   * @returns an Observable of the value for the key
   */
  get$(key: K): Observable<V> {
    return merge(
      defer(() => of(this.get(key))),
      this._subject.asObservable().pipe(
        map((map) => map.get(key)),
        distinctUntilChanged()
      )
    );
  }

  /**
   * Observes the entries in the map
   *
   * @returns an Observable of the entries in the map
   */
  entries$(): Observable<IterableIterator<[K, V]>> {
    return merge(
      defer(() => of(this.entries())),
      this._subject.asObservable().pipe(
        map((map) => map.entries()),
        distinctUntilChanged()
      )
    );
  }

  /**
   * Observes the keys in the map
   *
   * @returns an Observable of the keys in the map
   */
  keys$(): Observable<IterableIterator<K>> {
    return merge(
      defer(() => of(this.keys())),
      this._subject.asObservable().pipe(
        map((map) => map.keys()),
        distinctUntilChanged()
      )
    );
  }

  /**
   * Observes the values in the map
   *
   * @returns an Observable of the values in the map
   */
  values$(): Observable<IterableIterator<V>> {
    return merge(
      defer(() => of(this.values())),
      this._subject.asObservable().pipe(
        map((map) => map.values()),
        distinctUntilChanged()
      )
    );
  }
}
