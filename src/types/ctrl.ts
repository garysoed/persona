import {Vine} from 'grapevine';
import {Observable, OperatorFunction} from 'rxjs';

import {RenderContext} from '../render/types/render-context';

import {InputOutput, InputOutputThatResolvesWith, ITarget, ReferenceI, ReferenceO} from './io';
import {Target} from './target';


export interface Ctrl {
  readonly runs: ReadonlyArray<Observable<unknown>>;
}

export type ResolvedProvider<V, T> = (root: Target, context: RenderContext) => Binding<V, T>;

export type BindingSpec = {
  readonly [key: string]: unknown;
}

export type ResolvedBindingSpec = {
  readonly [key: string]: InputOutput;
};

export type ResolvedBindingSpecProvider<S extends ResolvedBindingSpec, T> = {
  readonly [K in keyof S]: ResolvedProvider<S[K], T>;
}

export type Spec = {
  readonly host?: Record<string, InputOutputThatResolvesWith<Element>>;
  readonly shadow?: Record<string, ResolvedBindingSpecProvider<ResolvedBindingSpec, any>>;
};

export type InputBinding<V> = Observable<V>;
export type OutputBinding<T, U, A extends readonly unknown[]> = (...args: A) => OperatorFunction<T, U>;
export type Binding<O, T> =
    O extends ITarget ? InputBinding<T> :
    O extends ReferenceI<infer V, any> ? InputBinding<V> :
    O extends ReferenceO<infer V, infer T, infer A, any> ? OutputBinding<V, T, A> :
    never;

export type Bindings<S extends BindingSpec, T> = {
  readonly [K in keyof S]: Binding<S[K], T>;
};

export type ShadowBindings<O> = {
  readonly [K in keyof O]: O[K] extends ResolvedBindingSpecProvider<infer S, infer T> ? Bindings<S, T> : never;
};

export interface Context<S extends Spec> extends RenderContext {
  readonly host: Bindings<S['host']&{}, HTMLElement>;
  readonly shadow: ShadowBindings<S['shadow']&{}>;
  readonly shadowRoot: ShadowRoot;
  readonly element: HTMLElement;
  readonly vine: Vine;
}

export type CtrlCtor<H extends Spec> = new (context: Context<H>) => Ctrl;