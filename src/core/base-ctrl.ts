import {Runnable} from 'gs-tools/export/rxjs';
import {Observable} from 'rxjs';

import {PersonaContext} from './persona-context';

interface ResolvedInput<T> { }

interface ResolvedOutput<T> { }

interface ResolvedInputOutputs {
  readonly [key: string]: ResolvedInput<any>|ResolvedOutput<any>;
}

interface ResolvedSelector {
  readonly _: ResolvedInputOutputs;
}

type InputsOf<S extends CustomElementSpec> = {
  [K in keyof S]: S[K]['_'] extends ResolvedInput<infer T> ? T : never;
}

type ValuesOf<S extends CustomElementSpec> = {
  [K in keyof S]: S[K]['_'] extends ResolvedInput<infer T> ? Observable<T> : never;
}

export type BaseCtrlCtor = new (context: PersonaContext) => BaseCtrl<any>;

export abstract class BaseCtrl<S extends CustomElementSpec> extends Runnable {
  constructor(
      protected readonly context: PersonaContext,
      private readonly customElementSpec: S,
  ) {
    super();
  }

  abstract inputs(): InputsOf<S>;

  abstract values(): ValuesOf<S>;
}