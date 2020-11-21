import {Input} from './input';
import {Resolver} from './resolver';


export interface UnresolvedInput<T> {
  resolve(resolver: Resolver<HTMLElement>): Input<T>;
}
