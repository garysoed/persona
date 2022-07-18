import {RenderContext} from '../render/types/render-context';
import {InputBinding, OutputBinding, ResolvedBindingSpecProvider, Spec} from '../types/ctrl';
import {InputOutputThatResolvesWith} from '../types/io';
import {Registration} from '../types/registration';
import {Target} from '../types/target';
import {ReversedSpec, reverseSpec} from '../util/reverse-spec';


type BindingProvider = (root: Target, context: RenderContext) => InputBinding<any>|OutputBinding<any, any, any[]>;

function getElement(target: Target, query: string|null): Element {
  if (query === null) {
    if (!(target instanceof Element)) {
      throw new Error('Target of "query" is not an Element');
    }
    return target;
  }

  const el = target.querySelector(query);
  if (!el) {
    throw new Error(`Element with matching query ${query} cannot be found`);
  }
  return el;
}


interface ExtraBindingSpec<T> {
  readonly [key: string]: InputOutputThatResolvesWith<T>;
}

export function query<E extends Element, S extends Spec>(
    query: string|null,
    registration: Registration<E, S>|null,
): ResolvedBindingSpecProvider<ReversedSpec<S['host']&{}>, E>;
export function query<E extends Element, S extends Spec, X extends ExtraBindingSpec<E>>(
    query: string|null,
    registration: Registration<E, S>|null,
    extra: X,
): ResolvedBindingSpecProvider<ReversedSpec<S['host']&{}> & X, E>
export function query<S extends Spec, X extends ExtraBindingSpec<Element>>(
    query: string|null,
    registration: Registration<Element, S>|null,
    extra?: ExtraBindingSpec<Element>,
): ResolvedBindingSpecProvider<ReversedSpec<S['host']&{}> & X, Element> {
  const providers: Record<string, BindingProvider> = {};
  const reversed = reverseSpec(registration?.spec.host ?? {});
  for (const key in reversed) {
    providers[key] = (root: Target, context: RenderContext) => reversed[key].resolve(
        getElement(root, query),
        context,
    );
  }

  const normalizedExtra: Record<string, InputOutputThatResolvesWith<Element>> = extra ?? {};
  for (const key in normalizedExtra) {
    providers[key] = (root: Target, context: RenderContext) => normalizedExtra[key].resolve(
        getElement(root, query),
        context,
    );
  }
  return providers as ResolvedBindingSpecProvider<ReversedSpec<S['host']&{}> & X, Element>;
}