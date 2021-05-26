import {Selectable} from '../types/selectable';
import {UnresolvedElementProperty} from '../types/unresolved-element-property';

export interface PropertySpecs<S extends Selectable> {
  readonly [key: string]: UnresolvedElementProperty<S, any>|PropertySpecs<S>;
}

export type Resolved<S extends Selectable, P extends PropertySpecs<S>> = {
  [K in keyof P]: P[K] extends UnresolvedElementProperty<S, infer R> ? R :
      P[K] extends PropertySpecs<S> ? Resolved<S, P[K]> : never;
};

