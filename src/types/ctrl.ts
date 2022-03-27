import {Vine} from 'grapevine';
import {Observable, OperatorFunction} from 'rxjs';

import {RenderContext} from '../render/types/render-context';

import {InputOutput, InputOutputThatResolvesWith, ReferenceI, ReferenceO} from './io';
import {Target} from './target';


export interface Ctrl {
  readonly runs: ReadonlyArray<Observable<unknown>>;
}

export type ResolvedProvider<V> = (root: Target, context: RenderContext) => Binding<V>;

export type BindingSpec = {
  readonly [key: string]: unknown;
}

export type ResolvedBindingSpec = {
  readonly [key: string]: InputOutput;
};

export type ResolvedBindingSpecProvider<S extends ResolvedBindingSpec> = {
  readonly [K in keyof S]: ResolvedProvider<S[K]>;
}

export type Spec = {
  readonly host?: Record<string, InputOutputThatResolvesWith<Element>>;
  readonly shadow?: Record<string, ResolvedBindingSpecProvider<ResolvedBindingSpec>>;
};

export type InputBinding<V> = Observable<V>;
export type OutputBinding<T, U, A extends readonly unknown[]> = (...args: A) => OperatorFunction<T, U>;
export type Binding<O> =
    O extends ReferenceI<infer V, any> ? InputBinding<V> :
    O extends ReferenceO<infer V, infer T, infer A, any> ? OutputBinding<V, T, A> :
    never;

export type Bindings<S extends BindingSpec> = {
  readonly [K in keyof S]: Binding<S[K]>;
};

export type ShadowBindings<O> = {
  readonly [K in keyof O]: O[K] extends ResolvedBindingSpecProvider<infer S> ? Bindings<S> : never;
};

export interface Context<S extends Spec> {
  readonly host: Bindings<S['host']&{}>;
  readonly shadow: ShadowBindings<S['shadow']&{}>;
  readonly shadowRoot: ShadowRoot;
  readonly element: HTMLElement;
  readonly vine: Vine;
}

export type CtrlCtor<H extends Spec> = new (context: Context<H>) => Ctrl;