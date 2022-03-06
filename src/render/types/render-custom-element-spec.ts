import {Observable} from 'rxjs';

import {Bindings, Spec} from '../../types/ctrl';
import {ReversedSpec} from '../../util/reverse-spec';

import {RenderSpecType} from './render-spec-type';


type ReversedBindings<S extends Spec> = Bindings<ReversedSpec<HTMLElement, S['host']&{}>>;

interface LiteRegistration<S extends Spec> {
  readonly spec: S;
  readonly tag: string;
}

interface InputRenderSpec<S extends Spec> {
  readonly registration: LiteRegistration<S>;
  readonly runs?: (bindings: ReversedBindings<S>) => ReadonlyArray<Observable<unknown>>;
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
