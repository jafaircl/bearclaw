import { isNil } from '@bearclaw/is';
import { Observer, Subject, Subscription } from 'rxjs';

/**
 * An interface that represents a Set-like object.
 */
export interface SetLike<T> {
  size: number;
  has: (value: T) => boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  add: (value: T) => any;
  clear: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete: (value: T) => any;
  values: () => IterableIterator<T>;
  keys: () => IterableIterator<T>;
  entries: () => IterableIterator<[T, T]>;
  [Symbol.iterator]: () => IterableIterator<T>;
}

/**
 * A factory function for creating a Set-like class.
 */
export type SetLikeFactory<T> = (values?: readonly T[]) => SetLike<T>;

/**
 * Default Set factory function
 *
 * @param values the values to use as the initial value
 * @returns a new Set
 */
function defaultSetFactory<T>(values?: readonly T[]): Set<T> {
  return new Set(values);
}

/**
 * A Subject that emits a Set but also implements a Set-like interface. This is
 * useful for cases where you want to expose a Set-like interface, but also
 * want to be able to emit the Set as an Observable.
 */
export class SetSubject<T> extends Subject<SetLike<T>> {
  /**
   * The underlying Set that is being emitted.
   */
  protected _set: SetLike<T>;

  /**
   * Build a new SetSubject from an array of values
   *
   * @param values the values to use as the initial value
   * @param setFactory the factory function to use to create the Set
   *
   * @example
   * ```typescript
   * const set = new SetSubject([1, 2, 3]);
   * set.subscribe((set) => console.log(set)); // Set(3) { 1, 2, 3 }
   * ```
   *
   * @example
   * ```typescript
   * class MySet<T> implements SetLike<T> {}
   *
   * function mySetFactory<T>(values?: readonly T[]): SetLike<T> {
   *  return new MySet(values);
   * }
   *
   * const set = new SetSubject([1, 2, 3], mySetFactory);
   * set.subscribe((set) => console.log(set)); // MySet(3) { 1, 2, 3 }
   * ```
   */
  constructor(values?: readonly T[], private setFactory = defaultSetFactory) {
    super();
    this.next(this.setFactory(values));
  }

  /**
   * Emit a new Set value. This will overwrite the current Set value. If you
   * want to add to the current Set, use the `add` method. If you want to
   * remove from the current Set, use the `delete` method. If you want to
   * clear the current Set, use the `clear` method.
   *
   * If no value is provided, the current Set will be emitted. This is useful
   * for cases where you want to force a re-emit of the current Set.
   *
   * @example
   * ```typescript
   * const set = new SetSubject([1, 2, 3]);
   * set.subscribe((set) => console.log(set)); // Set(3) { 1, 2, 3 }
   * set.next(new Set([4, 5, 6]));
   * set.subscribe((set) => console.log(set)); // Set(3) { 4, 5, 6 }
   * set.next();
   * set.subscribe((set) => console.log(set)); // Set(3) { 4, 5, 6 }
   * ```
   *
   * @param value the Set to emit
   */
  override next(value?: SetLike<T>): void {
    if (isNil(value)) {
      return super.next(this.setFactory([...this._set]));
    }
    this._set = this.setFactory([...value]);
    return super.next(this._set);
  }

  /**
   * Subscribe to the SetSubject. This will emit the current Set value, and then
   * emit again whenever the Set changes. If you only want to subscribe to
   * changes, use the `asObservable` method.
   *
   * Note that calling a mutation method on the emitted Set will not emit a new
   * value. For example, if you subscribe to the SetSubject, and then call
   * `set.add(1)` on the emitted value, the SetSubject will not emit a new
   * value. If you want to emit a new value, you must call the `add` method on
   * the SetSubject instead. This is to prevent infinite loops.
   *
   * @param observer the observer or a next function
   * @returns a Subscription
   */
  override subscribe(observer?: Partial<Observer<SetLike<T>>>): Subscription;
  override subscribe(next?: (value: SetLike<T>) => void): Subscription;
  override subscribe(
    observerOrNext?:
      | Partial<Observer<SetLike<T>>>
      | ((value: SetLike<T>) => void)
  ): Subscription {
    const subscription = super.subscribe(
      observerOrNext as Partial<Observer<SetLike<T>>>
    );
    !subscription.closed && this.next();
    return subscription;
  }

  // Mutation methods

  /**
   * Add a value to the Set. This will emit a new Set value.
   *
   * @example
   * ```typescript
   * const set = new SetSubject([1, 2, 3]);
   * set.subscribe((set) => console.log(set)); // Set(3) { 1, 2, 3 }
   * set.add(4);
   * set.subscribe((set) => console.log(set)); // Set(4) { 1, 2, 3, 4 }
   * ```
   *
   * @param value the value to add to the Set
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/add}
   * @see {@link https://rxjs.dev/api/index/class/Subject#next}
   */
  add(value: T): void {
    this._set.add(value);
    this.next();
  }

  /**
   * Delete a value from the Set. This will emit a new Set value.
   *
   * @example
   * ```typescript
   * const set = new SetSubject([1, 2, 3]);
   * set.subscribe((set) => console.log(set)); // Set(3) { 1, 2, 3 }
   * set.delete(2);
   * set.subscribe((set) => console.log(set)); // Set(2) { 1, 3 }
   * ```
   *
   * @param value the value to delete from the Set
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/delete}
   * @see {@link https://rxjs.dev/api/index/class/Subject#next}
   */
  delete(value: T): void {
    const deleted = this._set.delete(value);
    if (deleted) {
      this.next();
    }
  }

  /**
   * Clear the Set. This will emit a new Set value.
   *
   * @example
   * ```typescript
   * const set = new SetSubject([1, 2, 3]);
   * set.subscribe((set) => console.log(set)); // Set(3) { 1, 2, 3 }
   * set.clear();
   * set.subscribe((set) => console.log(set)); // Set(0) {}
   * ```
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/clear}
   * @see {@link https://rxjs.dev/api/index/class/Subject#next}
   */
  clear(): void {
    this._set.clear();
    this.next();
  }

  // Read methods

  /**
   * The iterator for the underlying Set. This is useful for cases where you
   * want to iterate over the underlying Set's values. For example, you can use
   * the spread operator to convert the SetSubject's values to an array.
   *
   * @example
   * ```typescript
   * const set = new SetSubject([1, 2, 3]);
   * const array = [...set];
   * console.log(array); // [1, 2, 3]
   * ```
   *
   * @returns an iterator for the Set
   */
  [Symbol.iterator](): IterableIterator<T> {
    return this._set[Symbol.iterator]();
  }

  /**
   * The size of the Set.
   *
   * @example
   * ```typescript
   * const set = new SetSubject([1, 2, 3]);
   * console.log(set.size); // 3
   * ```
   *
   * @returns the size of the Set
   */
  get size(): number {
    return this._set.size;
  }

  /**
   * Check whether the Set contains a value.
   *
   * @example
   * ```typescript
   * const set = new SetSubject([1, 2, 3]);
   * console.log(set.has(2)); // true
   * console.log(set.has(4)); // false
   * ```
   *
   * @param value the value to check
   * @returns a boolean indicating whether the Set contains the value
   */
  has(value: T): boolean {
    return this._set.has(value);
  }

  /**
   * The iterator for the underlying Set's entries. This is useful for cases
   * where you want to iterate over the underlying Set's entries. For example,
   * you can use the spread operator to convert the SetSubject's entries to an
   * array.
   *
   * @example
   * ```typescript
   * const set = new SetSubject([1, 2, 3]);
   * const array = [...set.entries()];
   * console.log(array); // [[1, 1], [2, 2], [3, 3]]
   * ```
   *
   * @returns an iterator for the Set's entries
   */
  entries(): IterableIterator<[T, T]> {
    return this._set.entries();
  }

  /**
   * The iterator for the underlying Set's keys. This is useful for cases where
   * you want to iterate over the underlying Set's keys. For example, you can
   * use the spread operator to convert the SetSubject's keys to an array.
   * Note that the keys and values of a Set are the same.
   *
   * @example
   * ```typescript
   * const set = new SetSubject([1, 2, 3]);
   * const array = [...set.keys()];
   * console.log(array); // [1, 2, 3]
   * ```
   *
   * @returns an iterator for the Set's keys
   */
  keys(): IterableIterator<T> {
    return this._set.keys();
  }

  /**
   * The iterator for the underlying Set's values. This is useful for cases
   * where you want to iterate over the underlying Set's values. For example,
   * you can use the spread operator to convert the SetSubject's values to an
   * array. Note that the keys and values of a Set are the same.
   *
   * @example
   * ```typescript
   * const set = new SetSubject([1, 2, 3]);
   * const array = [...set.values()];
   * console.log(array); // [1, 2, 3]
   * ```
   *
   * @returns an iterator for the Set's values
   */
  values(): IterableIterator<T> {
    return this._set.values();
  }
}
