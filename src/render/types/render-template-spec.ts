import {Observable} from 'rxjs';

import {Bindings, ResolvedBindingSpec, ResolvedBindingSpecProvider} from '../../types/ctrl';

import {RenderSpecType} from './render-spec-type';


export type TemplateBindingSpec = Record<string, ResolvedBindingSpecProvider<ResolvedBindingSpec, any>>;
export type TemplateBindings<O> = {
  readonly [K in keyof O]: O[K] extends ResolvedBindingSpecProvider<infer S, infer T> ? Bindings<S, T> : never;
}

interface InputRenderSpec<S extends TemplateBindingSpec> {
  readonly template$: Observable<HTMLTemplateElement>;
  readonly spec: S;
  readonly runs?: (bindings: TemplateBindings<S>) => ReadonlyArray<Observable<unknown>>;
}

export interface RenderTemplateSpec<S extends TemplateBindingSpec> extends InputRenderSpec<S> {
  readonly type: RenderSpecType.TEMPLATE;
  readonly runs: (bindings: TemplateBindings<S>) => ReadonlyArray<Observable<unknown>>;
}

export function renderTemplate<S extends TemplateBindingSpec>(
    input: InputRenderSpec<S>,
): RenderTemplateSpec<S> {
  return {
    type: RenderSpecType.TEMPLATE,
    runs: () => [],
    ...input,
  };
}