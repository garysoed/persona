import { Input } from './input';
import { Output } from './output';
import { Resolver } from './resolver';

export interface UnresolvedElementProperty<
    E extends Element,
    R extends Output<any>|Input<any>> {
  resolve(resolver: Resolver<E>): R;
}
