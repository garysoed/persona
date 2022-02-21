import {Observable, OperatorFunction, Subject} from 'rxjs';

import {Binding, Bindings, ResolvedBindingSpecProvider, UnresolvedBindingSpec} from '../../types/ctrl';

import {BaseRenderSpec} from './base-render-spec';
import {RenderSpecType} from './render-spec-type';


export type InputsOf<S extends UnresolvedBindingSpec> = Partial<{
  readonly [K in keyof S]: Binding<S[K]> extends Observable<infer T> ? Observable<T> : never;
}>;
export type OutputsOf<S extends UnresolvedBindingSpec> = Partial<{
  readonly [K in keyof S]: Binding<S[K]> extends () => OperatorFunction<infer T, unknown> ?
      Subject<T> : never;
}>;

export type TemplateBindingSpec = Record<string, ResolvedBindingSpecProvider<UnresolvedBindingSpec>>;
export type TemplateBindings<O> = {
  readonly [K in keyof O]: O[K] extends ResolvedBindingSpecProvider<infer S> ? Bindings<S> : never;
}

interface InputRenderSpec<S extends TemplateBindingSpec> extends BaseRenderSpec<Node> {
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