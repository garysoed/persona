import {Observable} from 'rxjs';

import {Bindings, Spec} from '../../types/ctrl';
import {InputOutputThatResolvesWith} from '../../types/io';
import {ReversedSpec} from '../../util/reverse-spec';

import {RenderSpecType} from './render-spec-type';


export type ExtraSpec = Record<string, InputOutputThatResolvesWith<Element>>;

interface LiteRegistration<S extends Spec> {
  readonly spec: S;
  readonly tag: string;
}

interface InputRenderSpec<S extends Spec, X extends ExtraSpec> {
  readonly registration: LiteRegistration<S>;
  readonly spec: X;
  readonly runs?: (bindings: Bindings<ReversedSpec<S['host']&{}>&(X&{}), unknown>) => ReadonlyArray<Observable<unknown>>;
}

export interface RenderElementSpec<S extends Spec, X extends ExtraSpec> extends InputRenderSpec<S, X> {
  readonly type: RenderSpecType.ELEMENT;
  readonly runs: (bindings: Bindings<ReversedSpec<S['host']&{}>&X, unknown>) => ReadonlyArray<Observable<unknown>>;
}

export function renderElement<S extends Spec, X extends ExtraSpec>(
    input: InputRenderSpec<S, X>,
): RenderElementSpec<S, X> {
  return {
    runs: input.runs ?? (() => []),
    type: RenderSpecType.ELEMENT,
    ...input,
  };
}
