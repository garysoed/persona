import { Output } from './output';
import { Resolver } from './resolver';


export interface UnresolvedOutput<T> {
  resolve(resolver: Resolver<HTMLElement>): Output<T>;
}
