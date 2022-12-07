import { map } from 'rxjs';

/**
 * Observes the values of a Set or Map emitted from a source.
 *
 * @example
 * ```typescript
 * const source = of(new Set([1, 2, 3]));
 * source.pipe(values()).subscribe((values) => {
 *   console.log([...values])
 * });
 * // [1, 2, 3]
 * ```
 *
 * @example
 * ```typescript
 * const set = new SetSubject();
 * set.pipe(values()).subscribe((values) => console.log([...values]));
 * // []
 * set.add(1);
 * set.pipe(values()).subscribe((values) => console.log([...values]));
 * // [1]
 * ```
 *
 * @example
 * ```typescript
 * const map = new MapSubject();
 * map.pipe(values()).subscribe((values) => console.log([...values]));
 * // []
 * map.set('key', 'value');
 * map.pipe(values()).subscribe((values) => console.log([...values]));
 * // ['value']
 * ```
 *
 * @returns an Observable of the values of the set or map
 */
export function values<V>() {
  return map((hasValues: { values: () => IterableIterator<V> }) =>
    hasValues.values()
  );
}
