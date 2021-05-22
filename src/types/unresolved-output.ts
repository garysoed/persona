import {Output} from './output';
import {Selectable} from './selectable';
import {UnresolvedElementProperty} from './unresolved-element-property';


export type UnresolvedOutput<S extends Selectable, T> = UnresolvedElementProperty<S, Output<T>>;
