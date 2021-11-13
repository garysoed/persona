import {Vine} from 'grapevine';
import {Observable, OperatorFunction} from 'rxjs';

import {IAttr, InputOutput, IValue, OAttr, OValue} from './io';


export interface Ctrl {
  readonly runs: ReadonlyArray<Observable<unknown>>;
}

// TODO(#8): Remove exports of ResolvedI and ResolvedO
export type ResolvedI<T> = {
  readonly value$: Observable<T>;
};

export type ResolvedO<T> = {
  update: () => OperatorFunction<T, unknown>;
};

export type Resolved<T extends InputOutput> =
    T extends IAttr ? IAttr&ResolvedI<string|null> :
    T extends OAttr ? OAttr&ResolvedO<string|null> :
    T extends IValue<infer V> ? IValue<V>&ResolvedI<V> :
    T extends OValue<infer V> ? OValue<V>&ResolvedO<V> : never;

export type ResolvedProvider<T extends InputOutput> =
    (root: ShadowRoot) => Resolved<T>;

export type UnresolvedIO<B extends InputOutput> = B & {
  resolve(target: HTMLElement): Resolved<B>;
};

export type BindingSpec = {
  readonly [key: string]: InputOutput;
}

export type UnresolvedBindingSpec = {
  readonly [key: string]:
      UnresolvedIO<IAttr>|UnresolvedIO<OAttr>|
      UnresolvedIO<IValue<unknown>>|UnresolvedIO<OValue<any>>;
}

export type ResolvedBindingSpec<S extends UnresolvedBindingSpec> = {
  readonly [K in keyof S]:
      S[K] extends IAttr ? Resolved<IAttr> :
      S[K] extends OAttr ? Resolved<OAttr> :
      S[K] extends IValue<infer T> ? Resolved<IValue<T>> :
      S[K] extends OValue<infer T> ? Resolved<OValue<T>> :
      never;
};

export type ResolvedBindingSpecProvider<S extends UnresolvedBindingSpec> = {
  readonly [K in keyof S]:
      S[K] extends IAttr ? ResolvedProvider<S[K]> :
      S[K] extends OAttr ? ResolvedProvider<S[K]> :
      S[K] extends IValue<unknown> ? ResolvedProvider<S[K]> :
      S[K] extends OValue<unknown> ? ResolvedProvider<S[K]> :
      never;
}

export type Spec = {
  readonly host?: UnresolvedBindingSpec;
  readonly shadow?: Record<string, ResolvedBindingSpecProvider<UnresolvedBindingSpec>>;
};

type Binding<T extends InputOutput> =
    T extends IAttr ? Observable<string|null> :
    T extends OAttr ? () => OperatorFunction<string|null, unknown> :
    T extends IValue<infer V> ? Observable<V> :
    T extends OValue<infer V> ? () => OperatorFunction<V, unknown> :
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
  readonly element: HTMLElement;
  readonly vine: Vine;
}

export type CtrlCtor<H extends Spec> = new (context: Context<H>) => Ctrl;