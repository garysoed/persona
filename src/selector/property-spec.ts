import { UnresolvedElementProperty } from '../types/unresolved-element-property';

export interface PropertySpecs<E extends Element> {
  readonly [key: string]: UnresolvedElementProperty<E, any>;
}

export type Resolved<E extends Element, P extends PropertySpecs<E>> = {
  [K in keyof P]: P[K] extends UnresolvedElementProperty<E, infer R> ? R : never;
};

