import {Observable} from 'rxjs';

import {Bindings, Spec} from '../../types/ctrl';
import {ReversedSpec} from '../../util/reverse-spec';

import {BaseRenderSpec} from './base-render-spec';
import {RenderSpec} from './render-spec';
import {RenderSpecType} from './render-spec-type';


type ReversedBindings<S extends Spec> = Bindings<ReversedSpec<S['host']&{}>>;

interface LiteRegistration<S extends Spec> {
  readonly spec: S;
  readonly tag: string;
}

interface InputRenderSpec<S extends Spec> extends BaseRenderSpec<HTMLElement> {
  readonly registration: LiteRegistration<S>;
  readonly attrs?: ReadonlyMap<string, Observable<string|undefined>>;
  readonly children?: Observable<readonly RenderSpec[]>;
  readonly runs?: (bindings: ReversedBindings<S>) => ReadonlyArray<Observable<unknown>>;
  readonly styles?: ReadonlyMap<string, Observable<string|null>>;
  readonly textContent?: Observable<string>;
}

export interface RenderCustomElementSpec<S extends Spec> extends InputRenderSpec<S> {
  readonly type: RenderSpecType.CUSTOM_ELEMENT;
  readonly runs: (bindings: ReversedBindings<S>) => ReadonlyArray<Observable<unknown>>;
}

export function renderCustomElement<S extends Spec>(input: InputRenderSpec<S>): RenderCustomElementSpec<S> {
  return {
    runs: input.runs ?? (() => []),
    type: RenderSpecType.CUSTOM_ELEMENT,
    ...input,
  };
}
