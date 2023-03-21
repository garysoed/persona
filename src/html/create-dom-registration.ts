import {source} from 'grapevine';

import {ResolvedBindingSpec} from '../types/ctrl';
import {InputOutputThatResolvesWith} from '../types/io';
import {ElementNamespace, Registration} from '../types/registration';


type DomRegistration<
    E extends Element,
    S extends Record<string, InputOutputThatResolvesWith<Element>>,
> = Registration<E, {host: S}>;

interface Input<E extends Element, S extends ResolvedBindingSpec> {
  readonly ctor: new (...args: readonly any[]) => E;
  readonly tag: string;
  readonly namespace: ElementNamespace;
  readonly spec: S;
}

export function createDomRegistration<
  E extends Element,
  S extends Record<string, InputOutputThatResolvesWith<Element>>,
>(
    input: Input<E, S>,
): DomRegistration<E, S> {
  return {
    $ctor: source(() => input.ctor),
    configure: () => undefined,
    spec: {
      host: input.spec,
    },
    tag: input.tag,
    namespace: input.namespace,
  };
}