import {Runnable} from 'gs-tools/export/rxjs';
import {getOwnPropertyKeys} from 'gs-tools/export/typescript';
import {merge, Observable} from 'rxjs';

import {Input} from '../types/input';
import {InternalElementSpec} from '../types/internal-element-spec';
import {Output} from '../types/output';
import {Selectable} from '../types/selectable';
import {Selector} from '../types/selector';

import {PersonaContext} from './persona-context';


type SelectedInputsOf<S extends Selector<Selectable>> = {
  readonly [K in keyof S['_']]: S['_'][K] extends Input<infer T> ? Observable<T> : never;
}

type SelectedOutputsOf<S extends Selector<Selectable>> = {
  readonly [K in keyof S['_']]?: S['_'][K] extends Output<infer T> ? Observable<T> : never;
}

export type InputsOf<S extends InternalElementSpec> = {
  readonly [K in keyof S]: SelectedInputsOf<S[K]>;
}

export type ValuesOf<S extends InternalElementSpec> = {
  readonly [K in keyof S]: SelectedOutputsOf<S[K]>;
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
    this.addSetup(this.renderAll());
  }

  protected abstract get values(): ValuesOf<S>;

  protected get inputs(): InputsOf<S> {
    const inputs: Partial<InputsOf<S>> = {};
    for (const selectorKey of getOwnPropertyKeys(this.internalElementSpec)) {
      const selectedInputs = this.getInputs(this.internalElementSpec[selectorKey]);
      inputs[selectorKey] = selectedInputs;
    }

    return inputs as InputsOf<S>;
  }

  private getInputs<S extends Selector<Selectable>>(selector: S): SelectedInputsOf<S> {
    const selectedInputs: {[key: string]: Observable<unknown>} = {};
    for (const entryKey of getOwnPropertyKeys(selector._) as readonly string[]) {
      const entry = selector._[entryKey];
      if (entry.type !== 'inp') {
        continue;
      }
      selectedInputs[entryKey] = entry.getValue(this.context);
    }
    // TODO: Remove typecast.
    return selectedInputs as unknown as SelectedInputsOf<S>;
  }

  private renderAll(): Observable<unknown> {
    const render$List: Array<Observable<unknown>> = [];
    for (const selectorKey of getOwnPropertyKeys(this.values)) {
      const specs = this.internalElementSpec[selectorKey]['_'];
      for (const specKey of getOwnPropertyKeys(specs)) {
        const entry = specs[specKey];
        if (entry.type !== 'out') {
          continue;
        }

        const rawValue = this.values[selectorKey]?.[specKey];
        if (!rawValue) {
          continue;
        }

        render$List.push(rawValue.pipe(entry.output(this.context)));
      }
    }
    return merge(...render$List);
  }
}