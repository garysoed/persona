import {Observable} from 'rxjs';

import {Bindings, Spec} from '../../types/ctrl';
import {InputOutputThatResolvesWith} from '../../types/io';
import {Registration} from '../../types/registration';
import {ReversedSpec} from '../../util/reverse-spec';

import {RenderSpecType} from './render-spec-type';


export type ExtraSpec = Record<string, InputOutputThatResolvesWith<Element>>;

interface LiteRegistration<S extends Spec, E extends Element> extends Pick<Registration<E, {}>, '$ctor'> {
  readonly spec: S;
  readonly tag: string;
}

interface InputRenderSpec<S extends Spec, X extends ExtraSpec, E extends Element> {
  readonly registration: LiteRegistration<S, E>;
  readonly spec: X;
  readonly runs?: (bindings: Bindings<ReversedSpec<S['host']&{}>&(X&{}), unknown>) => ReadonlyArray<Observable<unknown>>;
}

export interface RenderElementSpec<S extends Spec, X extends ExtraSpec, E extends Element> extends InputRenderSpec<S, X, E> {
  readonly type: RenderSpecType.ELEMENT;
  readonly runs: (bindings: Bindings<ReversedSpec<S['host']&{}>&X, unknown>) => ReadonlyArray<Observable<unknown>>;
}

export function renderElement<S extends Spec, X extends ExtraSpec, E extends Element>(
    input: InputRenderSpec<S, X, E>,
): RenderElementSpec<S, X, E> {
  return {
    runs: input.runs ?? (() => []),
    type: RenderSpecType.ELEMENT,
    ...input,
  };
}
