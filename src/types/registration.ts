import {Source, Vine} from 'grapevine';

import {Context, Ctrl, Spec} from './ctrl';


interface CustomElementCtor<E extends HTMLElement> {
  new (...params: any[]): E;
}

export interface Registration<
    E extends HTMLElement,
    S extends Spec,
> extends RegistrationSpec<S> {
  readonly configure: (vine: Vine) => void;
  readonly $ctor: Source<CustomElementCtor<E>>;
}

export interface RegistrationSpec<S extends Spec> {
  readonly tag: string;
  readonly ctrl: new (context: Context<S>) => Ctrl;
  readonly spec: S;
  readonly template: string;
  readonly deps?: ReadonlyArray<Registration<HTMLElement, any>>,
  readonly configure?: (vine: Vine) => void;
}