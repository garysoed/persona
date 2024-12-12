import {Observable} from 'rxjs';

import {Bindings, Spec} from '../../types/ctrl';
import {InputOutputThatResolvesWith} from '../../types/io';
import {Registration} from '../../types/registration';
import {ReversedSpec} from '../../util/reverse-spec';

import {RenderSpecType} from './render-spec-type';

export type ExtraSpec = Record<string, InputOutputThatResolvesWith<Element>>;

type LiteRegistration<S extends Spec, E extends Element> = Pick<
  Registration<E, S>,
  '$ctor' | 'tag' | 'namespace' | 'spec'
>;

interface InputRenderSpec<
  S extends Spec,
  X extends ExtraSpec,
  E extends Element,
> {
  readonly registration: LiteRegistration<S, E>;
  readonly runs?: (
    bindings: Bindings<ReversedSpec<S['host'] & {}> & (X & {}), unknown>,
  ) => ReadonlyArray<Observable<unknown>>;
  readonly spec: X;
}

export interface RenderElementSpec<
  S extends Spec,
  X extends ExtraSpec,
  E extends Element,
> extends InputRenderSpec<S, X, E> {
  readonly runs: (
    bindings: Bindings<ReversedSpec<S['host'] & {}> & X, unknown>,
  ) => ReadonlyArray<Observable<unknown>>;
  readonly type: RenderSpecType.ELEMENT;
}

export function renderElement<
  S extends Spec,
  X extends ExtraSpec,
  E extends Element,
>(input: InputRenderSpec<S, X, E>): RenderElementSpec<S, X, E> {
  return {
    runs: input.runs ?? (() => []),
    type: RenderSpecType.ELEMENT,
    ...input,
  };
}
