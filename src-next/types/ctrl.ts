import {Vine} from 'grapevine';
import {Observable, OperatorFunction} from 'rxjs';

import {InputOutput, IValue, OValue} from './io';


export interface Ctrl {
  readonly runs: ReadonlyArray<Observable<unknown>>;
}

// type OutputKeys<S extends HostInnerSpec> = {
//   readonly [K in keyof S]: S[K]['ioType'] extends IOType.OUTPUT ? K : never;
// }[keyof S];

// type HostInternalOutputBinding<S extends HostInnerSpec|InternalInnerSpec> = {
//   readonly [K in OutputKeys<S>]:
//       S[K] extends OValue<infer T> ? (type: T) => Observable<unknown> : never;
// };

// type HostOutputBinding<T> = T extends Spec<infer H, any> ? HostInternalOutputBinding<H> : never;
// type InternalOutputBinding<T> = T extends Spec<any, infer I> ? HostInternalOutputBinding<I>: never;

// interface OutputBinding<T> {
//   readonly host: HostOutputBinding<T>;
//   readonly internal: InternalOutputBinding<T>;
// }


// type InputKeys<S extends HostInnerSpec> = {
//   readonly [K in keyof S]: S[K]['ioType'] extends IOType.INPUT ? K : never;
// }[keyof S];

// type HostInternalInputBinding<S extends HostInnerSpec|InternalInnerSpec> = {
//   readonly [K in InputKeys<S>]: S[K] extends IValue<infer T> ? Observable<T> : never;
// };

// type HostInputBinding<T> = T extends Spec<infer H, any> ? HostInternalInputBinding<H> : never;
// type InternalInputBinding<T> = T extends Spec<any, infer I> ? HostInternalInputBinding<I> : never;

// interface InputBinding<T> {
//   readonly host: HostInputBinding<T>;
//   readonly internal: InternalInputBinding<T>;
// }

// TODO(#8): Remove exports of ResolvedI and ResolvedO
export type ResolvedI<T> = IValue<T> & {
  readonly value$: Observable<T>;
};

export type ResolvedO<T> = OValue<T> & {
  update: () => OperatorFunction<T, unknown>;
};

export type Resolved<V, T extends IValue<V>|OValue<V>> =
    T extends IValue<infer V> ? ResolvedI<V> :
    T extends OValue<infer V> ? ResolvedO<V> : never;

export type ResolvedProvider<V, T extends IValue<V>|OValue<V>> =
    (root: ShadowRoot) => Resolved<V, T>;

export type UnresolvedIO<T, B extends IValue<T>|OValue<T>> = B & {
  resolve(target: HTMLElement): Resolved<T, B>;
};

export type BindingSpec = {
  readonly [key: string]: InputOutput;
}

export type UnresolvedBindingSpec = {
  readonly [key: string]: UnresolvedIO<unknown, IValue<unknown>>|UnresolvedIO<any, OValue<any>>;
}

export type ResolvedBindingSpec<S extends UnresolvedBindingSpec> = {
  readonly [K in keyof S]:
      S[K] extends IValue<infer T> ? Resolved<T, IValue<T>> :
      S[K] extends OValue<infer T> ? Resolved<T, OValue<T>> :
      never;
};

export type ResolvedBindingSpecProvider<S extends UnresolvedBindingSpec> = {
  readonly [K in keyof S]:
      S[K] extends IValue<infer T> ? ResolvedProvider<T, S[K]> :
      S[K] extends OValue<infer T> ? ResolvedProvider<T, S[K]> :
      never;
}

export type Spec = {
  readonly host?: UnresolvedBindingSpec;
  readonly shadow?: Record<string, ResolvedBindingSpecProvider<UnresolvedBindingSpec>>;
};

type Binding<T extends InputOutput> =
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