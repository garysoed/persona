import {RenderContext} from '../render/types/render-context';
import {ResolvedBindingSpecProvider, ResolvedProvider, Spec, UnresolvedIO} from '../types/ctrl';
import {InputOutput} from '../types/io';
import {Registration} from '../types/registration';
import {Target} from '../types/target';
import {ReversedSpec, reverseSpec} from '../util/reverse-spec';


type RegistrationWithSpec<S extends Spec> = Pick<Registration<HTMLElement, S>, 'spec'>;


function getElement(target: Target, query: string): Element {
  const el = target.querySelector(query);
  if (!el) {
    throw new Error(`Element with matching query ${query} cannot be found`);
  }
  return el;
}


export type ExtraUnresolvedBindingSpec = Record<string, UnresolvedIO<InputOutput>>;

export function query<S extends Spec>(
    query: string,
    registration: RegistrationWithSpec<S>,
): ResolvedBindingSpecProvider<ReversedSpec<S['host']&{}>>;
export function query<S extends Spec, X extends ExtraUnresolvedBindingSpec>(
    query: string,
    registration: RegistrationWithSpec<S>,
    extra: X,
): ResolvedBindingSpecProvider<ReversedSpec<S['host']&{}> & X>
export function query<S extends Spec, X extends ExtraUnresolvedBindingSpec>(
    query: string,
    registration: RegistrationWithSpec<S>,
    extra?: X,
): ResolvedBindingSpecProvider<ReversedSpec<S['host']&{}> & X> {
  const providers: Partial<Record<string, ResolvedProvider<any>>> = {};
  const reversed = reverseSpec(registration.spec.host ?? {});
  for (const key in reversed) {
    providers[key] = (root: Target, context: RenderContext) => reversed[key].resolve(
        getElement(root, query),
        context,
    );
  }

  const normalizedExtra: Record<string, UnresolvedIO<any>> = extra ?? {};
  for (const key in normalizedExtra) {
    providers[key] = (root: Target, context: RenderContext) => normalizedExtra[key].resolve(
        getElement(root, query),
        context,
    );
  }
  return providers as ResolvedBindingSpecProvider<ReversedSpec<S['host']&{}> & X>;
}