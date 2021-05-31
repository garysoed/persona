import {getOwnPropertyKeys} from 'gs-tools/export/typescript';
import {Observable, of as observableOf} from 'rxjs';

import {UnresolvedSpec} from '../../main/api';
import {ComponentSpec} from '../../main/component-spec';
import {Input} from '../../types/input';
import {UnresolvedElementProperty} from '../../types/unresolved-element-property';

import {BaseRenderSpec} from './base-render-spec';
import {normalize, normalizeMap, ObservableOrValue} from './observable-or-value';
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
export type InputsOf<S extends UnresolvedSpec> = Partial<{
  readonly [K in keyof S]: S[K] extends UnresolvedElementProperty<Element, Input<infer T>> ? ObservableOrValue<T> : never;
}>;

export type NormalizedInputsOf<S extends UnresolvedSpec> = {
  readonly [K in keyof S]?: S[K] extends UnresolvedElementProperty<Element, Input<infer T>> ? Observable<T> : never;
}

interface InputRenderSpec<S extends UnresolvedSpec> extends BaseRenderSpec<HTMLElement> {
  readonly spec: ComponentSpec<S, Element>;
  readonly attrs?: ReadonlyMap<string, ObservableOrValue<string|undefined>>;
  readonly children?: ObservableOrValue<readonly RenderSpec[]>;
  readonly inputs?: InputsOf<S>;
  readonly styles?: ObservableOrValue<ReadonlyMap<string, string|null>>;
  readonly textContent?: ObservableOrValue<string>;
}

export interface RenderCustomElementSpec<S extends UnresolvedSpec> extends InputRenderSpec<S> {
  readonly type: RenderSpecType.CUSTOM_ELEMENT;
  readonly attrs?: ReadonlyMap<string, Observable<string|undefined>>;
  readonly children?: Observable<readonly RenderSpec[]>;
  readonly inputs?: NormalizedInputsOf<S>;
  readonly styles?: Observable<ReadonlyMap<string, string|null>>;
  readonly textContent?: Observable<string>;
}

export function renderCustomElement<S extends UnresolvedSpec>(input: InputRenderSpec<S>): RenderCustomElementSpec<S> {
  return {
    ...input,
    type: RenderSpecType.CUSTOM_ELEMENT,
    attrs: input.attrs ? normalizeMap(input.attrs) : undefined,
    children: input.children ? normalize(input.children) : undefined,
    inputs: input.inputs ? normalizedInputs(input.inputs) : undefined,
    styles: input.styles ? normalize(input.styles) : undefined,
    textContent: input.textContent !== undefined ? normalize(input.textContent) : undefined,
  };
}

function normalizedInputs<S extends UnresolvedSpec>(spec: InputsOf<S>): NormalizedInputsOf<S> {
  const output: {[K in keyof S]?: Observable<unknown>} = {};
  for (const key of getOwnPropertyKeys(spec)) {
    const v: ObservableOrValue<unknown> = spec[key];
    output[key] = v instanceof Observable ? v : observableOf(v);
  }
  return output as NormalizedInputsOf<S>;
}