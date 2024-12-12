import {Observable} from 'rxjs';

import {
  Bindings,
  ResolvedBindingSpec,
  ResolvedBindingSpecProvider,
} from '../../types/ctrl';

import {RenderSpecType} from './render-spec-type';

export type TemplateBindingSpec = Record<
  string,
  ResolvedBindingSpecProvider<ResolvedBindingSpec, any>
>;
export type TemplateBindings<O> = {
  readonly [K in keyof O]: O[K] extends ResolvedBindingSpecProvider<
    infer S,
    infer T
  >
    ? Bindings<S, T>
    : never;
};

interface InputRenderSpec<S extends TemplateBindingSpec> {
  readonly runs?: (
    bindings: TemplateBindings<S>,
  ) => ReadonlyArray<Observable<unknown>>;
  readonly spec: S;
  readonly template$: Observable<HTMLTemplateElement>;
}

export interface RenderTemplateSpec<S extends TemplateBindingSpec>
  extends InputRenderSpec<S> {
  readonly runs: (
    bindings: TemplateBindings<S>,
  ) => ReadonlyArray<Observable<unknown>>;
  readonly type: RenderSpecType.TEMPLATE;
}

export function renderTemplate<S extends TemplateBindingSpec>(
  input: InputRenderSpec<S>,
): RenderTemplateSpec<S> {
  return {
    runs: () => [],
    type: RenderSpecType.TEMPLATE,
    ...input,
  };
}
