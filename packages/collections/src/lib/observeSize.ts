import { map } from 'rxjs';

/**
 * Observes the size of a Set or Map emitted from a source.
 *
 * @example
 * ```typescript
 * const source = of(new Set([1, 2, 3]));
 * source.pipe(observeSize()).subscribe((size) => console.log(size)); // 3
 * ```
 *
 * @example
 * ```typescript
 * const set = new SetSubject();
 * set.pipe(observeSize()).subscribe((size) => console.log(size)); // 0
 * set.add(1);
 * set.pipe(observeSize()).subscribe((size) => console.log(size)); // 1
 * ```
 *
 * @example
 * ```typescript
 * const map = new MapSubject();
 * map.pipe(observeSize()).subscribe((size) => console.log(size)); // 0
 * map.set('key', 'value');
 * map.pipe(observeSize()).subscribe((size) => console.log(size)); // 1
 * ```
 *
 * @returns an Observable of the size of the set or map
 */
export function observeSize<K, V = K>() {
  return map((setOrMap: Set<K> | Map<K, V>) => setOrMap.size);
}
