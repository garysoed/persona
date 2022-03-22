import {source} from 'grapevine';

import {ResolvedBindingSpec} from '../types/ctrl';
import {Registration} from '../types/registration';


type DomRegistration<E extends HTMLElement, S extends ResolvedBindingSpec> =
    Registration<E, {host: S}>;

interface Input<E extends HTMLElement, S extends ResolvedBindingSpec> {
  readonly ctor: new (...args: readonly any[]) => E;
  readonly spec: S;
}

export function createDomRegistration<
  E extends HTMLElement,
  S extends ResolvedBindingSpec,
  P extends ResolvedBindingSpec
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