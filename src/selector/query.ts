import {RenderContext} from '../render/types/render-context';
import {InputBinding, OutputBinding, ResolvedBindingSpecProvider, Spec} from '../types/ctrl';
import {InputOutputThatResolvesWith} from '../types/io';
import {Registration} from '../types/registration';
import {Target} from '../types/target';
import {ReversedSpec, reverseSpec} from '../util/reverse-spec';


type BindingProvider = (root: Target, context: RenderContext) => InputBinding<any>|OutputBinding<any, any, any[]>;

function getElement(target: Target, query: string): Element {
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
    query: string,
    registration: Registration<E, S>,
): ResolvedBindingSpecProvider<ReversedSpec<S['host']&{}>>;
export function query<E extends Element, S extends Spec, X extends ExtraBindingSpec<E>>(
    query: string,
    registration: Registration<E, S>,
    extra: X,
): ResolvedBindingSpecProvider<ReversedSpec<S['host']&{}> & X>
export function query<S extends Spec, X extends ExtraBindingSpec<Element>>(
    query: string,
    registration: Registration<Element, S>,
    extra?: ExtraBindingSpec<Element>,
): ResolvedBindingSpecProvider<ReversedSpec<S['host']&{}> & X> {
  const providers: Record<string, BindingProvider> = {};
  const reversed = reverseSpec(registration.spec.host ?? {});
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
  return providers as ResolvedBindingSpecProvider<ReversedSpec<S['host']&{}> & X>;
}