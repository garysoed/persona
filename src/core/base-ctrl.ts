import {Runnable} from 'gs-tools/export/rxjs';
import {getOwnPropertyKeys} from 'gs-tools/export/typescript';
import {Observable} from 'rxjs';

import {Input} from '../types/input';
import {InternalElementSpec} from '../types/internal-element-spec';
import {Output} from '../types/output';

import {PersonaContext} from './persona-context';


export type InputsOf<S extends InternalElementSpec> = {
  readonly [K in keyof S]: S[K]['_'] extends Input<infer T> ? T : never;
}

export type ValuesOf<S extends InternalElementSpec> = {
  readonly [K in keyof S]: S[K]['_'] extends Output<infer T> ? Observable<T> : never;
}

export type BaseCtrlCtor = new (context: PersonaContext) => BaseCtrl<any>;

export abstract class BaseCtrl<S extends InternalElementSpec> extends Runnable {
  protected readonly shadowRoot = this.context.shadowRoot;
  protected readonly vine = this.context.vine;

  constructor(
      protected readonly context: PersonaContext,
      private readonly internalElementSpec: S,
  ) {
    super();
  }

  protected get inputs(): InputsOf<S> {
    const inputs: Partial<InputsOf<S>> = {};
    for (const selectorKey in getOwnPropertyKeys(this.internalElementSpec)) {
      const selectedInputs = {};
      const selector = this.internalElementSpec[selectorKey];
      for (const entryKey in getOwnPropertyKeys(selector._)) {
        const entry = selector._[entryKey];
      }
    }
  }

  abstract get values(): ValuesOf<S>;
}