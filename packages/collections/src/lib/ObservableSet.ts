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
 * A set that can be observed for changes
 */
export class ObservableSet<V> extends Set<V> {
  private readonly _subject = new Subject<ObservableSet<V>>();

  /**
   * Build a new ObservableSet from an iterable of values
   *
   * @param values an iterable of values
   */
  constructor(values?: readonly V[]) {
    super(values);
    this._subject.next(this);
  }

  // Observable getters

  /**
   * Observe the size of the set.
   *
   * This will emit the current size of the set, and then emit again whenever
   * the size changes.
   *
   * @example
   * ```typescript
   * const set = new ObservableSet();
   * set.add('foo');
   * set.size$.subscribe((size) => console.log(size)); // 1
   * ```
   */
  get size$(): Observable<number> {
    return merge(
      defer(() => of(this.size)),
      this._subject.asObservable().pipe(map((set) => set.size))
    ).pipe(distinctUntilChanged());
  }

  // Overrides for all mutating methods

  /**
   * Appends a new element with a specified value to the end of the Set.
   *
   * @param value the value to add
   * @returns the set instance
   */
  override add(value: V): this {
    super.add(value);
    this._subject?.next(this);
    return this;
  }

  /**
   * Removes a specified value from the Set.
   *
   * @param value the value to delete
   * @returns the set instance
   */
  override delete(value: V): boolean {
    const deleted = super.delete(value);
    this._subject.next(this);
    return deleted;
  }

  /**
   * Clear all values from the set.
   */
  override clear(): void {
    super.clear();
    this._subject.next(this);
  }

  // Observable methods

  /**
   * Observe whether the set contains a value.
   *
   * This will emit whether the set contains the value, and then emit again
   * whenever the set changes.
   *
   * @example
   * ```typescript
   * const set = new ObservableSet([1, 2, 3]);
   * set.has$(1).subscribe((has) => console.log(has)); // true
   * set.has$(4).subscribe((has) => console.log(has)); // false
   * ```
   *
   * @param value the value to check
   * @returns an observable that emits a boolean indicating whether the value
   * is in the set
   */
  has$(value: V): Observable<boolean> {
    return merge(
      defer(() => of(this.has(value))),
      this._subject.asObservable().pipe(map((set) => set.has(value)))
    ).pipe(distinctUntilChanged());
  }

  /**
   * Observe the entries in the set.
   *
   * This will emit the current entries in the set, and then emit again whenever
   * the set changes.
   *
   * Because the set is unordered, the order of the emitted entries is not
   * guaranteed.
   *
   * As the value of `set.entries()` will be a new iterator each time, this
   * will not use `distinctUntilChanged`.
   *
   * @example
   * ```typescript
   * const set = new ObservableSet([1, 2, 3]);
   * set.entries$.subscribe((entries) => console.log(entries));
   * // [[1, 1], [2, 3], [3, 3]]
   * ```
   *
   * @returns an Observable of entries in the set
   */
  entries$(): Observable<IterableIterator<[V, V]>> {
    return merge(
      defer(() => of(this.entries())),
      this._subject.asObservable().pipe(map((set) => set.entries()))
    );
  }

  /**
   * Observes the keys in the set.
   *
   * This will emit the current keys in the set, and then emit again whenever
   * the set changes.
   *
   * Because the set is unordered, the order of the emitted keys is not
   * guaranteed.
   *
   * As the value of `set.keys()` will be a new iterator each time, this
   * will not use `distinctUntilChanged`.
   *
   * @example
   * ```typescript
   * const set = new ObservableSet([1, 2, 3]);
   * set.keys$.subscribe((keys) => console.log(keys)); // [1, 2, 3]
   * ```
   *
   * @returns an Observable of keys in the set
   */
  keys$(): Observable<IterableIterator<V>> {
    return merge(
      defer(() => of(this.keys())),
      this._subject.asObservable().pipe(map((set) => set.keys()))
    );
  }

  /**
   * Observes the values in the set.
   *
   * This will emit the current values in the set, and then emit again whenever
   * the set changes.
   *
   * Because the set is unordered, the order of the emitted values is not
   * guaranteed.
   *
   * As the value of `set.values()` will be a new iterator each time, this
   * will not use `distinctUntilChanged`.
   *
   * @example
   * ```typescript
   * const set = new ObservableSet([1, 2, 3]);
   * set.values$.subscribe((values) => console.log(values)); // [1, 2, 3]
   * ```
   *
   * @returns an Observable of values in the set
   */
  values$(): Observable<IterableIterator<V>> {
    return merge(
      defer(() => of(this.values())),
      this._subject.asObservable().pipe(map((set) => set.values()))
    );
  }

  // Subscription methods

  /**
   * This will complete the underlying subject, which will prevent any further
   * emissions from the ObservableSet methods.
   *
   * This is useful if you want to prevent memory leaks when you no longer need
   * to observe the set.
   *
   * This will not clear the set.
   *
   * This will not unsubscribe any Observables returned from the ObservableSet
   * methods.
   *
   * @example
   * ```typescript
   * const set = new ObservableSet();
   * const subscription = set.size$.subscribe((size) => console.log(size));
   * set.complete();
   * ```
   */
  complete(): void {
    this._subject.complete();
  }
}
