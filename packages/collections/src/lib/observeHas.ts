import { map } from 'rxjs';

/**
 * Obsereves whether a Set or Map emitted from the source has a key.
 *
 * @example
 * ```typescript
 * const source = of(new Set([1, 2, 3]));
 * source.pipe(observeHas(2)).subscribe((hasKey) => console.log(hasKey));
 * // true
 * ```
 *
 * @example
 * ```typescript
 * const set = new SetSubject();
 * set.pipe(observeHas(1)).subscribe((hasKey) => console.log(hasKey));
 * // false
 * set.add(1);
 * set.pipe(observeHas(1)).subscribe((hasKey) => console.log(hasKey));
 * // true
 * ```
 *
 * @example
 * ```typescript
 * const map = new MapSubject();
 * map.pipe(observeHas('key')).subscribe((hasKey) => console.log(hasKey));
 * // false
 * map.set('key', 'value');
 * map.pipe(observeHas('key')).subscribe((hasKey) => console.log(hasKey));
 * // true
 * ```
 *
 * @param key the key to observe
 * @returns an Observable of a boolean indicating whether the set or map has
 * the key
 */
export function observeHas<K>(key: K) {
  return map((hasHas: { has: (k: K) => boolean }) => hasHas.has(key));
}
