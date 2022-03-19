import {Source, Vine} from 'grapevine';

import {Context, Ctrl, Spec} from './ctrl';


interface CustomElementCtor<E extends HTMLElement> {
  new (...params: any[]): E;
}

export interface Registration<
    E extends HTMLElement,
    S extends Spec,
> {
  readonly configure: (vine: Vine) => void;
  readonly spec: S;
  readonly tag: string;
  readonly $ctor: Source<CustomElementCtor<E>>;
}

export interface CustomElementRegistration<E extends HTMLElement, S extends Spec> extends Registration<E, S> {
  readonly ctrl: new (context: Context<S>) => Ctrl;
  readonly deps: ReadonlyArray<CustomElementRegistration<HTMLElement, any>>;
  readonly template: string;
}

export interface RegistrationSpec<S extends Spec> {
  readonly tag: string;
  readonly ctrl: new (context: Context<S>) => Ctrl;
  readonly spec: S;
  readonly template: string;
  readonly deps?: ReadonlyArray<CustomElementRegistration<HTMLElement, any>>,
  readonly configure?: (vine: Vine) => void;
}