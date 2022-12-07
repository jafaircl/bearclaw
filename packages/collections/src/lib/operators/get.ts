import { map } from 'rxjs';

/**
 * Observes the value of a key in a Map emitted from a source.
 *
 * @example
 * ```typescript
 * const source = of(new Map([['key', 'value']]));
 * source.pipe(get('key')).subscribe((value) => {
 *  console.log(value)
 * });
 * // 'value'
 * ```
 *
 * @example
 * ```typescript
 * const map = new MapSubject();
 * map.pipe(get('key')).subscribe((value) => console.log(value));
 * // undefined
 * map.set('key', 'value');
 * map.pipe(get('key')).subscribe((value) => console.log(value));
 * // 'value'
 * ```
 *
 * @param key the key to observe
 * @returns an Observable of the value corresponding to the key in the map
 */
export function get<K, V>(key: K) {
  return map((hasGet: { get: (key: K) => V }) => hasGet.get(key));
}
