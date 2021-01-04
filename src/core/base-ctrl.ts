import {Runnable} from 'gs-tools/export/rxjs';
import {getOwnPropertyKeys} from 'gs-tools/export/typescript';
import {merge, Observable, OperatorFunction, pipe} from 'rxjs';

import {PropertySpecs} from '../selector/property-spec';
import {Input, INPUT_TYPE} from '../types/input';
import {Output, OUTPUT_TYPE} from '../types/output';
import {Selectable} from '../types/selectable';
import {Selector, SELECTOR_TYPE} from '../types/selector';

import {PersonaContext} from './persona-context';


type SelectedInputsOf<B extends Selectable, P extends PropertySpecs<B>, S extends Selector<B, P>> = {
  readonly [K in keyof P]: S['_'][K] extends Input<infer T> ? Observable<T> : never;
}

type SelectedRenderersOf<B extends Selectable, P extends PropertySpecs<B>, S extends Selector<B, P>> = {
  readonly [K in keyof P]: S['_'][K] extends Output<infer T> ? OperatorFunction<T, unknown> : never;
};

export type InputsOf<S extends {}> = {
  readonly [K in keyof S]: S[K] extends Selector<infer B, infer P> ? SelectedInputsOf<B, P, S[K]> : never;
}

type RenderersOf<S extends {}> = {
  readonly [K in keyof S]: S[K] extends Selector<infer B, infer P> ? SelectedRenderersOf<B, P, S[K]> : never;
}

export type BaseCtrlCtor = new (context: PersonaContext) => BaseCtrl<any>;

export abstract class BaseCtrl<S extends {}> extends Runnable {
  protected readonly shadowRoot = this.context.shadowRoot;
  protected readonly vine = this.context.vine;

  constructor(
      protected readonly context: PersonaContext,
      protected readonly specs: S,
  ) {
    super();
    this.addSetup(this.renderAll());
  }

  protected abstract get renders(): ReadonlyArray<Observable<unknown>>;

  protected get inputs(): InputsOf<S> {
    const inputs: {[K in keyof S]?: SelectedInputsOf<Selectable, {}, Selector<Selectable, {}>>} = {};
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

  protected get renderers(): RenderersOf<S> {
    const inputs: {[K in keyof S]?: SelectedRenderersOf<Selectable, {}, Selector<Selectable, {}>>} = {};
    for (const selectorKey of getOwnPropertyKeys(this.specs)) {
      const maybeSelector = this.specs[selectorKey];
      if (!SELECTOR_TYPE.check(maybeSelector)) {
        continue;
      }
      const selectedInputs = this.getRenderers(maybeSelector);
      inputs[selectorKey] = selectedInputs;
    }

    // TODO: Remove typecast.
    return inputs as RenderersOf<S>;
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

  private getRenderers<B extends Selectable, P extends PropertySpecs<B>, S extends Selector<B, P>>(
      selector: S,
  ): SelectedRenderersOf<B, P, S> {
    const selectedRenderers: {[K in keyof P]?: (value$: Observable<unknown>) => Observable<unknown>} = {};
    for (const entryKey of getOwnPropertyKeys(selector._)) {
      const entry = selector._[entryKey];
      if (!OUTPUT_TYPE.check(entry)) {
        continue;
      }
      selectedRenderers[entryKey] = pipe(entry.output(this.context));
    }
    // TODO: Remove typecast.
    return selectedRenderers as SelectedRenderersOf<B, P, S>;
  }

  private renderAll(): Observable<unknown> {
    return merge(...this.renders);
  }
}