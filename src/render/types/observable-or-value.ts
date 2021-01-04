import {$asMap, $map, $pipe} from 'gs-tools/export/collect';
import {Observable, of as observableOf} from 'rxjs';

export type ObservableOrValue<T> = T|Observable<T>;

export function normalize<T>(value: ObservableOrValue<T>): Observable<T> {
  return value instanceof Observable ? value : observableOf(value);
}


export function normalizeMap<K, V>(map: ReadonlyMap<K, Observable<V>|V>): ReadonlyMap<K, Observable<V>> {
  return $pipe(map, $map(([key, value]) => [key, normalize(value)] as const), $asMap());
}
