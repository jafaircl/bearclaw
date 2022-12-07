import { map } from 'rxjs';

/**
 * Observes the entries of a Set or Map emitted from a source.
 *
 * @example
 * ```typescript
 * const source = of(new Set([1, 2, 3]));
 * source.pipe(entries()).subscribe((entries) => {
 *   console.log([...entries])
 * });
 * // [[1, 1], [2, 2], [3, 3]]
 * ```
 *
 * @example
 * ```typescript
 * const set = new SetSubject();
 * set.pipe(entries()).subscribe((entries) => console.log([...entries]));
 * // []
 * set.add(1);
 * set.pipe(entries()).subscribe((entries) => console.log([...entries]));
 * // [[1, 1]]
 * ```
 *
 * @example
 * ```typescript
 * const map = new MapSubject();
 * map.pipe(entries()).subscribe((entries) => console.log([...entries]));
 * // []
 * map.set('key', 'value');
 * map.pipe(entries()).subscribe((entries) => console.log([...entries]));
 * // [['key', 'value']]
 * ```
 *
 * @returns an Observable of the entries of the set or map
 */
export function entries<K, V>() {
  return map((hasEntries: { entries: () => IterableIterator<[K, V]> }) =>
    hasEntries.entries()
  );
}
