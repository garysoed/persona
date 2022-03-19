import {source} from 'grapevine';

import {UnresolvedBindingSpec} from '../types/ctrl';
import {Registration} from '../types/registration';


type DomRegistration<E extends HTMLElement, S extends UnresolvedBindingSpec<E>> =
    Registration<E, {host: S}>;

interface Input<E extends HTMLElement, S extends UnresolvedBindingSpec<E>> {
  readonly ctor: new (...args: readonly any[]) => E;
  readonly spec: S;
}

export function createDomRegistration<
  E extends HTMLElement,
  S extends UnresolvedBindingSpec<E>,
  P extends UnresolvedBindingSpec<HTMLElement>
>(
    input: Input<E, S>,
    parentRegistration?: DomRegistration<HTMLElement, P>,
): DomRegistration<E, S> {
  return {
    $ctor: source(() => input.ctor),
    configure: () => undefined,
    spec: {
      host: {
        ...(parentRegistration?.spec.host ?? {}),
        ...input.spec,
      },
    },
  };
}