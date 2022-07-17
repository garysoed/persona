import {Source, Vine} from 'grapevine';

import {Context, Ctrl, Spec} from './ctrl';


interface CustomElementCtor<E extends Element> {
  new (...params: any[]): E;
}

export enum ElementNamespace {
  HTML = 'http://www.w3.org/1999/xhtml',
  MATH_ML = 'http://www.w3.org/1998/Math/MathML',
  SVG = 'http://www.w3.org/2000/svg',
}

export interface Registration<
    E extends Element,
    S extends Spec,
> {
  readonly configure: (vine: Vine) => void;
  readonly spec: S;
  readonly tag: string;
  readonly namespace: ElementNamespace;
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
  readonly namespace?: ElementNamespace;
}