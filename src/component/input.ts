import { Observable } from 'rxjs';

export interface Input<T> {
  getValue(root: ShadowRoot): Observable<T>;
}
