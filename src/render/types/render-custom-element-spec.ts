import {Observable, OperatorFunction, Subject} from 'rxjs';

import {Binding, Spec, UnresolvedBindingSpec} from '../../types/ctrl';

import {BaseRenderSpec} from './base-render-spec';
import {RenderSpec} from './render-spec';
import {RenderSpecType} from './render-spec-type';


/**
 * Values of the input for the given spec.
 *
 * @remarks
 * The values must be `Observable`. They must emit whenever the value changes to update the values
 * of the custom element.
 *
 * @thHidden
 */
export type InputsOf<S extends UnresolvedBindingSpec> = Partial<{
  readonly [K in keyof S]: Binding<S[K]> extends Observable<infer T> ? Observable<T> : never;
}>;

export type OutputsOf<S extends UnresolvedBindingSpec> = Partial<{
  readonly [K in keyof S]: Binding<S[K]> extends () => OperatorFunction<infer T, unknown> ?
      Subject<T> : never;
}>;

interface LiteRegistration<S extends Spec> {
  readonly spec: S;
  readonly tag: string;
}

interface InputRenderSpec<S extends Spec> extends BaseRenderSpec<HTMLElement> {
  readonly registration: LiteRegistration<S>;
  readonly attrs?: ReadonlyMap<string, Observable<string|undefined>>;
  readonly children?: Observable<readonly RenderSpec[]>;
  readonly inputs?: InputsOf<S['host']&{}>;
  readonly onOutputs?: OutputsOf<S['host']&{}>;
  readonly styles?: ReadonlyMap<string, Observable<string|null>>;
  readonly textContent?: Observable<string>;
}

export interface RenderCustomElementSpec<S extends Spec> extends InputRenderSpec<S> {
  readonly type: RenderSpecType.CUSTOM_ELEMENT;
  readonly attrs?: ReadonlyMap<string, Observable<string|undefined>>;
  readonly children?: Observable<readonly RenderSpec[]>;
  readonly inputs: InputsOf<S['host']&{}>;
  readonly styles?: ReadonlyMap<string, Observable<string|null>>;
  readonly textContent?: Observable<string>;
}

export function renderCustomElement<S extends Spec>(input: InputRenderSpec<S>): RenderCustomElementSpec<S> {
  return {
    ...input,
    type: RenderSpecType.CUSTOM_ELEMENT,
    inputs: input.inputs ?? {},
    onOutputs: input.onOutputs ?? {},
  };
}
