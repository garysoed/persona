import {Input} from './input';
import {UnresolvedElementProperty} from './unresolved-element-property';


export type UnresolvedInput<E extends Element, T> = UnresolvedElementProperty<E, Input<T>>;
