import {source} from 'grapevine';

import {UnresolvedBindingSpec} from '../types/ctrl';
import {Registration} from '../types/registration';


type DomRegistration<E extends HTMLElement, S extends UnresolvedBindingSpec<E>> =
    Registration<E, {host: S}>;

export function createDomRegistration<E extends HTMLElement, S extends UnresolvedBindingSpec<E>>(
    ctor: new (...args: readonly any[]) => E,
    tag: string,
    host: S,
): DomRegistration<E, S> {
  return {
    $ctor: source(() => ctor),
    configure: () => undefined,
    spec: {host},
    tag,
  };
}