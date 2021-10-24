import {Vine} from 'grapevine';
import {Observable} from 'rxjs';

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


type ResolvedI<T> = IValue<T> & {
  readonly value$: Observable<T>;
};

export type Resolved<V, T extends IValue<V>|OValue<V>> =
    T extends IValue<infer V> ? ResolvedI<V> : never;

export type UnresolvedIO<T, B extends IValue<T>|OValue<T>> = B & {
  resolve(target: HTMLElement): Resolved<T, B>;
};

export type BindingSpec = {
  readonly [key: string]: InputOutput;
}

export type UnresolvedBindingSpec = {
  readonly [key: string]: UnresolvedIO<unknown, InputOutput>;
}

export type ResolvedBinding<S extends UnresolvedBindingSpec> = {
  readonly [K in keyof S]:
      S[K] extends IValue<infer T> ? Resolved<T, S[K]> :
      S[K] extends OValue<infer T> ? Resolved<T, S[K]> :
      never;
};

export type Spec = {
  readonly host: UnresolvedBindingSpec;
};

type Binding<T extends InputOutput> =
    T extends IValue<infer V> ? Observable<V> :
    never;

export type Bindings<S extends BindingSpec> = {
  readonly [K in keyof S]: Binding<S[K]>;
};

export interface Context<S extends Spec> {
  readonly host: Bindings<S['host']>;
  readonly element: HTMLElement;
  readonly vine: Vine;
  // readonly outputs: OutputBinding<T>;
  // readonly inputs: InputBinding<T>;
}

export type CtrlCtor<H extends Spec> = new (context: Context<H>) => Ctrl;