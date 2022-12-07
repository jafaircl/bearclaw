import { map } from 'rxjs';

/**
 * Observes the size of a Set or Map emitted from a source.
 *
 * @example
 * ```typescript
 * const source = of(new Set([1, 2, 3]));
 * source.pipe(size()).subscribe((size) => console.log(size)); // 3
 * ```
 *
 * @example
 * ```typescript
 * const set = new SetSubject();
 * set.pipe(size()).subscribe((size) => console.log(size)); // 0
 * set.add(1);
 * set.pipe(size()).subscribe((size) => console.log(size)); // 1
 * ```
 *
 * @example
 * ```typescript
 * const map = new MapSubject();
 * map.pipe(size()).subscribe((size) => console.log(size)); // 0
 * map.set('key', 'value');
 * map.pipe(size()).subscribe((size) => console.log(size)); // 1
 * ```
 *
 * @returns an Observable of the size of the set or map
 */
export function size() {
  return map((hasSize: { size: number }) => hasSize.size);
}
