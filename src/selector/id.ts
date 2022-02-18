import {ResolvedBindingSpecProvider, Spec} from '../types/ctrl';
import {Registration} from '../types/registration';
import {ReversedSpec} from '../util/reverse-spec';

import {ExtraUnresolvedBindingSpec, query} from './query';


type RegistrationWithSpec<S extends Spec> = Pick<Registration<HTMLElement, S>, 'spec'>;


export function id<S extends Spec>(
    id: string,
    registration: RegistrationWithSpec<S>,
): ResolvedBindingSpecProvider<ReversedSpec<S['host']&{}>>;
export function id<S extends Spec, X extends ExtraUnresolvedBindingSpec>(
    id: string,
    registration: RegistrationWithSpec<S>,
    extra: X,
): ResolvedBindingSpecProvider<ReversedSpec<S['host']&{}> & X>
export function id(
    id: string,
    registration: RegistrationWithSpec<Spec>,
    extra?: ExtraUnresolvedBindingSpec,
): ResolvedBindingSpecProvider<ReversedSpec<Spec['host']&{}> & ExtraUnresolvedBindingSpec> {
  if (extra) {
    return query(`#${id}`, registration, extra);
  }

  return query(`#${id}`, registration);
}