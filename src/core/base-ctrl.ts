import {Runnable} from 'gs-tools/export/rxjs';
import {getOwnPropertyKeys} from 'gs-tools/export/typescript';
import {merge, Observable} from 'rxjs';

import {PropertySpecs} from '../selector/property-spec';
import {Input, INPUT_TYPE} from '../types/input';
import {Output, OUTPUT_TYPE} from '../types/output';
import {Selectable} from '../types/selectable';
import {Selector, SELECTOR_TYPE} from '../types/selector';

import {PersonaContext} from './persona-context';


type SelectedInputsOf<B extends Selectable, P extends PropertySpecs<B>, S extends Selector<B, P>> = {
  readonly [K in keyof P]: S['_'][K] extends Input<infer T> ? Observable<T> : never;
}

type SelectedOutputsOf<B extends Selectable, P extends PropertySpecs<B>, S extends Selector<B, P>> = {
  readonly [K in keyof P]?: S['_'][K] extends Output<infer T> ? Observable<T> : never;
}

export type InputsOf<S extends {}> = {
  readonly [K in keyof S]: S[K] extends Selector<infer B, infer P> ? SelectedInputsOf<B, P, S[K]> : never;
}

// TODO: Make this exclude empty ones.
export type ValuesOf<S extends {}> = {
  readonly [K in keyof S]?: S[K] extends Selector<infer B, infer P> ? SelectedOutputsOf<B, P, S[K]> : never;
}

export type BaseCtrlCtor = new (context: PersonaContext) => BaseCtrl<any>;

export abstract class BaseCtrl<S extends {}> extends Runnable {
  protected readonly shadowRoot = this.context.shadowRoot;
  protected readonly vine = this.context.vine;

  constructor(
      protected readonly context: PersonaContext,
  ) {
    super();
    this.addSetup(this.renderAll());
  }

  protected abstract get specs(): S;

  protected abstract get values(): ValuesOf<S>;

  protected get inputs(): InputsOf<S> {
    const inputs: Partial<{[K in keyof S]?: SelectedOutputsOf<Selectable, {}, Selector<Selectable, {}>>}> = {};
    for (const selectorKey of getOwnPropertyKeys(this.specs)) {
      const maybeSelector = this.specs[selectorKey];
      if (!SELECTOR_TYPE.check(maybeSelector)) {
        continue;
      }
      const selectedInputs = this.getInputs(maybeSelector);
      inputs[selectorKey] = selectedInputs;
    }

    // TODO: Remove typecast.
    return inputs as InputsOf<S>;
  }

  private getInputs<B extends Selectable, P extends PropertySpecs<B>, S extends Selector<B, P>>(
      selector: S,
  ): SelectedInputsOf<B, P, S> {
    const selectedInputs: {[K in keyof P]?: Observable<unknown>} = {};
    for (const entryKey of getOwnPropertyKeys(selector._)) {
      const entry = selector._[entryKey];
      if (!INPUT_TYPE.check(entry)) {
        continue;
      }
      selectedInputs[entryKey] = entry.getValue(this.context);
    }
    // TODO: Remove typecast.
    return selectedInputs as SelectedInputsOf<B, P, S>;
  }

  // TODO: Can be moved outside the class.
  private renderAll(): Observable<unknown> {
    const render$List: Array<Observable<unknown>> = [];
    for (const selectorKey of getOwnPropertyKeys(this.values)) {
      const maybeSelector = this.specs[selectorKey];
      if (!SELECTOR_TYPE.check(maybeSelector)) {
        continue;
      }

      for (const specKey of getOwnPropertyKeys(maybeSelector._)) {
        const entry = maybeSelector._[specKey];
        if (!OUTPUT_TYPE.check(entry)) {
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