import {source} from 'grapevine';

import {ResolvedBindingSpec} from '../types/ctrl';
import {InputOutputThatResolvesWith} from '../types/io';
import {Registration} from '../types/registration';


type DomRegistration<E extends HTMLElement, S extends Record<string, InputOutputThatResolvesWith<Element>>> =
    Registration<E, {host: S}>;

interface Input<E extends HTMLElement, S extends ResolvedBindingSpec> {
  readonly ctor: new (...args: readonly any[]) => E;
  readonly spec: S;
}

export function createDomRegistration<
  E extends HTMLElement,
  S extends Record<string, InputOutputThatResolvesWith<Element>>,
  P extends Record<string, InputOutputThatResolvesWith<Element>>
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