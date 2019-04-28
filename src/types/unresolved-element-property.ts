import { Observable } from '@rxjs';
import { Input } from './input';
import { Output } from './output';

export type Resolver<E extends Element> = (root: ShadowRoot) => Observable<E>;

export interface UnresolvedElementProperty<
    E extends Element,
    R extends Output<any>|Input<any>> {
  resolve(resolver: Resolver<E>): R;
}
