import { Observable } from 'rxjs';

export interface ElementProperty<E extends Element, T> {
  getValue(element: E): Observable<T>;
}
