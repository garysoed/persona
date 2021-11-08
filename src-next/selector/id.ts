import {UnresolvedIValue} from '../input/value';
import {UnresolvedOValue} from '../output/value';
import {ResolvedBindingSpecProvider, ResolvedProvider, Spec, UnresolvedBindingSpec} from '../types/ctrl';
import {ApiType, IOType, IValue, OValue} from '../types/io';
import {Registration} from '../types/registration';

type ReversedIO<T> =
    T extends IValue<infer V> ? OValue<V> :
    T extends OValue<infer V> ? IValue<V> :
    never;

type ReversedSpec<U extends UnresolvedBindingSpec> = UnresolvedBindingSpec & {
  readonly [K in keyof U]: ReversedIO<U[K]>;
};

type RegistrationWithSpec<S extends Spec> = Pick<Registration<HTMLElement, S>, 'spec'>;

type ReversableIO = IValue<any>|OValue<any>;
export function id<S extends Spec>(
    id: string,
    registration: RegistrationWithSpec<S>,
): ResolvedBindingSpecProvider<ReversedSpec<S['host']>> {
  const reversed = reverse(registration.spec.host);
  const providers: Partial<Record<keyof S['host'], ResolvedProvider<any, ReversableIO>>> = {};
  for (const key in reversed) {
    providers[key as keyof S['host']] = (root: ShadowRoot) => reversed[key].resolve(getElement(root, id));
  }
  return providers as ResolvedBindingSpecProvider<ReversedSpec<S['host']>>;
}

function getElement(root: ShadowRoot, id: string): HTMLElement {
  const el = root.getElementById(id);
  if (!el) {
    throw new Error(`Element with ID ${id} cannot be found`);
  }
  return el;
}

function reverse<U extends UnresolvedBindingSpec>(spec: U): ReversedSpec<U> {
  const reversed: Partial<Record<keyof U, ReversableIO>> = {};

  for (const key in spec) {
    reversed[key] = reverseIO(spec[key]);
  }
  return reversed as ReversedSpec<U>;
}

function reverseIO<T extends ReversableIO>(io: T): ReversedIO<T>;
function reverseIO(io: ReversableIO): ReversableIO {
  switch (io.apiType) {
    case ApiType.VALUE:
      switch (io.ioType) {
        case IOType.INPUT:
          return new UnresolvedOValue(io.defaultValue, io.key, io.valueType) as OValue<any>;
        case IOType.OUTPUT:
          return new UnresolvedIValue(io.defaultValue, io.key, io.valueType);
      }
  }
}
