import {Vine} from 'grapevine';
import {Observable, OperatorFunction} from 'rxjs';

import {RenderContext} from '../render/types/render-context';
import {RenderSpec} from '../render/types/render-spec';

import {IAttr, IClass, IEvent, IFlag, InputOutput, IValue, OAttr, OClass, OEvent, OFlag, OSingle, OValue} from './io';
import {Target} from './target';


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
    T extends IClass ? IClass&ResolvedI<boolean> :
    T extends OClass ? OClass&ResolvedO<boolean> :
    T extends IEvent ? IEvent&ResolvedI<Event> :
    T extends OEvent ? OEvent&ResolvedO<Event> :
    T extends IFlag ? IFlag&ResolvedI<boolean> :
    T extends OFlag ? OFlag&ResolvedO<boolean> :
    T extends OSingle ? OSingle&ResolvedO<RenderSpec|null> :
    T extends IValue<infer V> ? IValue<V>&ResolvedI<V> :
    T extends OValue<infer V> ? OValue<V>&ResolvedO<V> : never;

export type ResolvedProvider<T extends InputOutput> =
    (root: ShadowRoot, context: RenderContext) => Resolved<T>;

export type UnresolvedIO<B extends InputOutput> = B & {
  resolve(target: Target, context: RenderContext): Resolved<B>;
};

export type BindingSpec = {
  readonly [key: string]: InputOutput;
}

export type UnresolvedBindingSpec = {
  readonly [key: string]:
      UnresolvedIO<IAttr>|UnresolvedIO<OAttr>|
      UnresolvedIO<IClass>|UnresolvedIO<OClass>|
      UnresolvedIO<IEvent>|UnresolvedIO<OEvent>|
      UnresolvedIO<IFlag>|UnresolvedIO<OFlag>|
      UnresolvedIO<OSingle>|
      UnresolvedIO<IValue<unknown>>|UnresolvedIO<OValue<any>>;
}

export type ResolvedBindingSpec<S extends UnresolvedBindingSpec> = {
  readonly [K in keyof S]:
      S[K] extends InputOutput ? Resolved<S[K]> :
      never;
};

export type ResolvedBindingSpecProvider<S extends UnresolvedBindingSpec> = {
  readonly [K in keyof S]:
      S[K] extends InputOutput ? ResolvedProvider<S[K]> :
      never;
}

export type Spec = {
  readonly host?: UnresolvedBindingSpec;
  readonly shadow?: Record<string, ResolvedBindingSpecProvider<UnresolvedBindingSpec>>;
};

export type Binding<T extends InputOutput> =
    Resolved<T> extends ResolvedI<infer V> ? Observable<V> :
    Resolved<T> extends ResolvedO<infer V> ? () => OperatorFunction<V, unknown> :
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