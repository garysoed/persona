import {Observable} from 'rxjs';

import {Bindings, ResolvedBindingSpec, ResolvedBindingSpecProvider} from '../../types/ctrl';
import {ElementForType, ParserSupportedType} from '../html-parse-service';

import {RenderSpecType} from './render-spec-type';

export type ExtraSpec<E> = Record<string, ResolvedBindingSpecProvider<ResolvedBindingSpec, E>>;
export type ExtraHtmlBindings<O> = {
  readonly [K in keyof O]: O[K] extends ResolvedBindingSpecProvider<infer S, infer T> ? Bindings<S, T> : never;
}

interface Input<T extends ParserSupportedType, X extends ExtraSpec<ElementForType<T>>> {
  readonly raw: Observable<string>;
  readonly spec: X;
  readonly parseType: T;
  readonly runs?: (bindings: ExtraHtmlBindings<X>) => ReadonlyArray<Observable<unknown>>;
}

export interface RenderHtmlSpec<T extends ParserSupportedType, X extends ExtraSpec<ElementForType<T>>> extends Input<T, X> {
  readonly type: RenderSpecType.HTML;
  readonly raw: Observable<string>
  readonly runs: (bindings: ExtraHtmlBindings<X>) => ReadonlyArray<Observable<unknown>>;
}

export function renderHtml<T extends ParserSupportedType, X extends ExtraSpec<ElementForType<T>>>(
    input: Input<T, X>,
): RenderHtmlSpec<T, X> {
  return {
    type: RenderSpecType.HTML,
    runs: () => [],
    ...input,
  };
}
