import { Observable } from 'rxjs';
import { Input } from './input';
import { Output } from './output';

export interface UnresolvedElementProperty<
    E extends Element,
    R extends Output<any>|Input<any>> {
  resolve(resolver: (root: ShadowRoot) => Observable<E>): R;
}
