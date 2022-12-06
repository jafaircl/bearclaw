import { map } from 'rxjs';

/**
 * Observes the keys of a Set or Map emitted from a source.
 *
 * @example
 * ```typescript
 * const source = of(new Set([1, 2, 3]));
 * source.pipe(observeKeys()).subscribe((keys) => {
 *  console.log([...keys])
 * });
 * // [1, 2, 3]
 * ```
 *
 * @example
 * ```typescript
 * const set = new SetSubject();
 * set.pipe(observeKeys()).subscribe((keys) => console.log([...keys]));
 * // []
 * set.add(1);
 * set.pipe(observeKeys()).subscribe((keys) => console.log([...keys]));
 * // [1]
 * ```
 *
 * @example
 * ```typescript
 * const map = new MapSubject();
 * map.pipe(observeKeys()).subscribe((keys) => console.log([...keys]));
 * // []
 * map.set('key', 'value');
 * map.pipe(observeKeys()).subscribe((keys) => console.log([...keys]));
 * // ['key']
 * ```
 *
 * @returns an Observable of the keys of the set or map
 */
export function observeKeys<K>() {
  return map((hasKeys: { keys: () => IterableIterator<K> }) => hasKeys.keys());
}
