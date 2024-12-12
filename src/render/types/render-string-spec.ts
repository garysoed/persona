import {Observable} from 'rxjs';

import {
  Bindings,
  ResolvedBindingSpec,
  ResolvedBindingSpecProvider,
} from '../../types/ctrl';
import {ParseType} from '../html-parse-service';

import {RenderSpecType} from './render-spec-type';

export type ExtraSpec = Record<
  string,
  ResolvedBindingSpecProvider<ResolvedBindingSpec, Element>
>;
export type ExtraHtmlBindings<O> = {
  readonly [K in keyof O]: O[K] extends ResolvedBindingSpecProvider<
    infer S,
    infer T
  >
    ? Bindings<S, T>
    : never;
};

interface Input<T extends ParseType, X extends ExtraSpec> {
  readonly parseType: T;
  readonly raw: Observable<string>;
  readonly runs?: (
    bindings: ExtraHtmlBindings<X>,
  ) => ReadonlyArray<Observable<unknown>>;
  readonly spec: X;
}

export interface RenderStringSpec<T extends ParseType, X extends ExtraSpec>
  extends Input<T, X> {
  readonly raw: Observable<string>;
  readonly runs: (
    bindings: ExtraHtmlBindings<X>,
  ) => ReadonlyArray<Observable<unknown>>;
  readonly type: RenderSpecType.STRING;
}

export function renderString<T extends ParseType, X extends ExtraSpec>(
  input: Input<T, X>,
): RenderStringSpec<T, X> {
  return {
    runs: () => [],
    type: RenderSpecType.STRING,
    ...input,
  };
}
