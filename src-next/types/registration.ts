import {Source, Vine} from 'grapevine';

import {CtrlCtor} from './ctrl';
import {HostInnerSpec, InternalInnerSpec, Spec} from './spec';

export interface Registration<
    C extends CustomElementConstructor = CustomElementConstructor,
    S extends Spec<HostInnerSpec, InternalInnerSpec> = Spec<HostInnerSpec, InternalInnerSpec>,
> extends Source<C>, RegistrationSpec<S> {
  readonly configure: (vine: Vine) => void;
}

export interface RegistrationSpec<S extends Spec<HostInnerSpec, InternalInnerSpec>> {
  readonly tag: string;
  readonly ctrl: CtrlCtor<S>;
  readonly template: string;
  readonly deps?: readonly Registration[],
  readonly spec?: Spec<HostInnerSpec, InternalInnerSpec>;
  readonly configure?: (vine: Vine) => void;
}