import {Runnable} from 'gs-tools/export/rxjs';
import {getOwnPropertyKeys} from 'gs-tools/export/typescript';
import {defer, merge, Observable, OperatorFunction, pipe} from 'rxjs';

import {PropertySpecs, Resolved} from '../selector/property-spec';
import {Input, INPUT_TYPE} from '../types/input';
import {Output, OUTPUT_TYPE} from '../types/output';
import {Selectable} from '../types/selectable';
import {Selector, SELECTOR_TYPE} from '../types/selector';

import {ShadowContext} from './shadow-context';


type SelectedInputsOf<R extends Resolved<Selectable, PropertySpecs<Selectable>>> = {
  readonly [K in keyof R]: R[K] extends Input<infer T> ? Observable<T> :
      R[K] extends Resolved<any, any> ? SelectedInputsOf<R[K]> :
      never;
}

type SelectedRenderersOf<R extends Resolved<Selectable, PropertySpecs<Selectable>>> = {
  readonly [K in keyof R]: R[K] extends Output<infer T> ? OperatorFunction<T, unknown> :
      R[K] extends Resolved<any, any> ? SelectedRenderersOf<R[K]> :
      never;
};

export type InputsOf<S extends {}> = {
  readonly [K in keyof S]: S[K] extends Selector<any, any> ? SelectedInputsOf<S[K]['_']> : never;
}

type RenderersOf<S extends {}> = {
  readonly [K in keyof S]: S[K] extends Selector<any, any> ? SelectedRenderersOf<S[K]['_']> : never;
}

export type BaseCtrlCtor = new (context: ShadowContext) => BaseCtrl<any>;


export abstract class BaseCtrl<S extends {}> extends Runnable {
  protected readonly shadowRoot = this.context.shadowRoot;
  protected readonly vine = this.context.vine;

  constructor(
      protected readonly context: ShadowContext,
      readonly specs: S,
  ) {
    super();
    this.addSetup(this.renderAll());
  }

  protected abstract get renders(): ReadonlyArray<Observable<unknown>>;

  protected get inputs(): InputsOf<S> {
    const inputs: {[K in keyof S]?: SelectedInputsOf<Resolved<Selectable, {}>>} = {};
    for (const selectorKey of getOwnPropertyKeys(this.specs)) {
      const maybeSelector = this.specs[selectorKey];
      if (!SELECTOR_TYPE.check(maybeSelector)) {
        continue;
      }
      const selectedInputs = this.getInputs(maybeSelector._);
      inputs[selectorKey] = selectedInputs;
    }

    // TODO: Remove typecast.
    return inputs as InputsOf<S>;
  }

  protected get renderers(): RenderersOf<S> {
    const inputs: {[K in keyof S]?: SelectedRenderersOf<Resolved<Selectable, {}>>} = {};
    for (const selectorKey of getOwnPropertyKeys(this.specs)) {
      const maybeSelector = this.specs[selectorKey];
      if (!SELECTOR_TYPE.check(maybeSelector)) {
        continue;
      }
      const selectedInputs = this.getRenderers(maybeSelector._);
      inputs[selectorKey] = selectedInputs;
    }

    // TODO: Remove typecast.
    return inputs as RenderersOf<S>;
  }

  private getInputs<R extends Resolved<Selectable, PropertySpecs<Selectable>>>(
      selector: R,
  ): SelectedInputsOf<R> {
    const selectedInputs: {[K in keyof R]?: Observable<unknown>|SelectedInputsOf<any>} = {};
    for (const entryKey of getOwnPropertyKeys(selector)) {
      const entry = selector[entryKey];
      if (INPUT_TYPE.check(entry)) {
        selectedInputs[entryKey] = (entry as Input<unknown>).getValue(this.context);
        continue;
      }

      if (isResolvedType(entry)) {
        selectedInputs[entryKey] = this.getInputs(entry);
        continue;
      }
    }
    // TODO: Remove typecast.
    return selectedInputs as SelectedInputsOf<R>;
  }

  private getRenderers<R extends Resolved<Selectable, PropertySpecs<Selectable>>>(
      selector: R,
  ): SelectedRenderersOf<R> {
    const selectedRenderers: {[K in keyof R]?: OperatorFunction<unknown, unknown>|SelectedRenderersOf<any>} = {};
    for (const entryKey of getOwnPropertyKeys(selector)) {
      const entry = selector[entryKey];
      if (OUTPUT_TYPE.check(entry)) {
        selectedRenderers[entryKey] = pipe((entry as Output<unknown>).output(this.context));
        continue;
      }

      if (isResolvedType(entry)) {
        selectedRenderers[entryKey] = this.getRenderers(entry);
        continue;
      }
    }

    // TODO: Remove typecast.
    return selectedRenderers as SelectedRenderersOf<R>;
  }

  private renderAll(): Observable<unknown> {
    return defer(() => merge(...this.renders));
  }
}

function isResolvedType<S extends Selectable, P extends PropertySpecs<S>>(
    target: unknown,
): target is Resolved<S, P> {
  return target instanceof Object;
}
