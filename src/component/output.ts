import { Observable } from 'rxjs';

export interface Output<T> {
  output(root: ShadowRoot, valueObs: Observable<T>): Observable<unknown>;
}

export interface UnresolvedElementPropertyOutput<E extends Element, T> {
  resolve(resolver: (root: ShadowRoot) => Observable<E>): Output<T>;
}
