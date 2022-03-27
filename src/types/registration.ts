import {Source, Vine} from 'grapevine';

import {Context, Ctrl, Spec} from './ctrl';


interface CustomElementCtor<E extends Element> {
  new (...params: any[]): E;
}

export interface Registration<
    E extends Element,
    S extends Spec,
> {
  readonly configure: (vine: Vine) => void;
  readonly spec: S;
  readonly $ctor: Source<CustomElementCtor<E>>;
}

export interface CustomElementRegistration<E extends HTMLElement, S extends Spec> extends Registration<E, S> {
  readonly ctrl: new (context: Context<S>) => Ctrl;
  readonly deps: ReadonlyArray<CustomElementRegistration<HTMLElement, any>>;
  readonly tag: string;
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