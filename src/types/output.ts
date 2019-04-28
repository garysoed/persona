import { Observable } from '@rxjs';

export interface Output<T> {
  output(root: ShadowRoot, valueObs: Observable<T>): Observable<unknown>;
}
