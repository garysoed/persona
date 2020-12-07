import {UnresolvedSpec} from '../../main/api';
import {ComponentSpec} from '../../main/component-spec';
import {UnresolvedInput} from '../../types/unresolved-input';

import {BaseRenderSpec} from './base-render-spec';
import {ObservableOrValue} from './observable-or-value';
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
  readonly [K in keyof S]: S[K] extends UnresolvedInput<infer T> ? ObservableOrValue<T> : never;
}>;

export interface RenderCustomElementSpec<S extends UnresolvedSpec> extends BaseRenderSpec {
  readonly type: RenderSpecType.CUSTOM_ELEMENT;
  readonly spec: ComponentSpec<S>;
  readonly attrs?: ReadonlyMap<string, ObservableOrValue<string|undefined>>;
  readonly children?: ObservableOrValue<readonly RenderSpec[]>;
  readonly inputs?: InputsOf<S>;
  readonly textContent?: ObservableOrValue<string>;
}