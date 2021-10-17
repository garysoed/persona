import {Vine} from 'grapevine';
import {Observable} from 'rxjs';

import {IOType, IVariable, OVariable} from './io';
import {HostInnerSpec, InternalInnerSpec, Spec} from './spec';


export interface Ctrl {
  readonly runs: ReadonlyArray<Observable<unknown>>;
}

type OutputKeys<S extends HostInnerSpec> = {
  readonly [K in keyof S]: S[K]['ioType'] extends IOType.OUTPUT ? K : never;
}[keyof S];

type HostInternalOutputBinding<S extends HostInnerSpec|InternalInnerSpec> = {
  readonly [K in OutputKeys<S>]:
      S[K] extends OVariable<infer T> ? (type: T) => Observable<unknown> : never;
};

type HostOutputBinding<T> = T extends Spec<infer H, any> ? HostInternalOutputBinding<H> : never;
type InternalOutputBinding<T> = T extends Spec<any, infer I> ? HostInternalOutputBinding<I>: never;

interface OutputBinding<T> {
  readonly host: HostOutputBinding<T>;
  readonly internal: InternalOutputBinding<T>;
}


type InputKeys<S extends HostInnerSpec> = {
  readonly [K in keyof S]: S[K]['ioType'] extends IOType.INPUT ? K : never;
}[keyof S];

type HostInternalInputBinding<S extends HostInnerSpec|InternalInnerSpec> = {
  readonly [K in InputKeys<S>]: S[K] extends IVariable<infer T> ? Observable<T> : never;
};

type HostInputBinding<T> = T extends Spec<infer H, any> ? HostInternalInputBinding<H> : never;
type InternalInputBinding<T> = T extends Spec<any, infer I> ? HostInternalInputBinding<I> : never;

interface InputBinding<T> {
  readonly host: HostInputBinding<T>;
  readonly internal: InternalInputBinding<T>;
}

export interface Context<T> {
  readonly element: HTMLElement;
  readonly vine: Vine;
  // readonly outputs: OutputBinding<T>;
  // readonly inputs: InputBinding<T>;
}

export type CtrlCtor<T> = new (context: Context<T>) => Ctrl;