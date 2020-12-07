import {Observable, of as observableOf} from 'rxjs';

export type ObservableOrValue<T> = T|Observable<T>;

export function normalize<T>(value: ObservableOrValue<T>): Observable<T> {
  return value instanceof Observable ? value : observableOf(value);
}
