import {Source, Vine} from 'grapevine';

import {CtrlCtor, Spec} from './ctrl';

interface CustomElementCtor<E extends HTMLElement> {
  new (...params: any[]): E;
}

export interface Registration<
    E extends HTMLElement,
    S extends Spec,
> extends Source<CustomElementCtor<E>>, RegistrationSpec<S> {
  readonly configure: (vine: Vine) => void;
}

export interface RegistrationSpec<S extends Spec> {
  readonly tag: string;
  readonly ctrl: CtrlCtor<S>;
  readonly spec: S;
  readonly template: string;
  readonly deps?: ReadonlyArray<Registration<HTMLElement, Spec>>,
  readonly configure?: (vine: Vine) => void;
}