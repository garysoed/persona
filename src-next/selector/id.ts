import {UnresolvedIAttr} from '../input/attr';
import {UnresolvedIFlag} from '../input/flag';
import {UnresolvedIValue} from '../input/value';
import {UnresolvedOAttr} from '../output/attr';
import {UnresolvedOFlag} from '../output/flag';
import {UnresolvedOValue} from '../output/value';
import {ResolvedBindingSpecProvider, ResolvedProvider, Spec, UnresolvedBindingSpec, UnresolvedIO} from '../types/ctrl';
import {ApiType, IAttr, IFlag, IOType, IValue, OAttr, OFlag, OValue} from '../types/io';
import {Registration} from '../types/registration';

type ReversedIO<T> =
    T extends IAttr ? OAttr :
    T extends OAttr ? IAttr :
    T extends IFlag ? OFlag :
    T extends OFlag ? IFlag :
    T extends IValue<infer V> ? OValue<V> :
    T extends OValue<infer V> ? IValue<V> :
    never;

type ReversedSpec<U extends UnresolvedBindingSpec> = UnresolvedBindingSpec & {
  readonly [K in keyof U]: ReversedIO<U[K]>;
};

type RegistrationWithSpec<S extends Spec> = Pick<Registration<HTMLElement, S>, 'spec'>;

type ReversableIO = IAttr|OAttr|IFlag|OFlag|IValue<any>|OValue<any>;

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
    case ApiType.ATTR:
      switch (io.ioType) {
        case IOType.INPUT:
          return new UnresolvedOAttr(io.attrName);
        case IOType.OUTPUT:
          return new UnresolvedIAttr(io.attrName);
      }
      break;
    case ApiType.FLAG:
      switch (io.ioType) {
        case IOType.INPUT:
          return new UnresolvedOFlag(io.attrName);
        case IOType.OUTPUT:
          return new UnresolvedIFlag(io.attrName);
      }
      break;
    case ApiType.VALUE:
      switch (io.ioType) {
        case IOType.INPUT:
          return new UnresolvedOValue(io.defaultValue, io.key, io.valueType);
        case IOType.OUTPUT:
          return new UnresolvedIValue(io.defaultValue, io.key, io.valueType);
      }
  }
}


export type ExtraUnresolvedBindingSpec = Record<
    string,
    UnresolvedIO<IAttr>|UnresolvedIO<OAttr>|
    UnresolvedIO<IFlag>|UnresolvedIO<OFlag>
>;

export function id<S extends Spec>(
    id: string,
    registration: RegistrationWithSpec<S>,
): ResolvedBindingSpecProvider<ReversedSpec<S['host']&{}>>;
export function id<S extends Spec, X extends ExtraUnresolvedBindingSpec>(
    id: string,
    registration: RegistrationWithSpec<S>,
    extra: X,
): ResolvedBindingSpecProvider<ReversedSpec<S['host']&{}> & X>
export function id<S extends Spec, X extends ExtraUnresolvedBindingSpec>(
    id: string,
    registration: RegistrationWithSpec<S>,
    extra?: X,
): ResolvedBindingSpecProvider<ReversedSpec<S['host']&{}> & X> {
  const providers: Partial<Record<string, ResolvedProvider<ReversableIO>>> = {};
  const reversed = reverse(registration.spec.host ?? {});
  for (const key in reversed) {
    providers[key] = (root: ShadowRoot) => reversed[key].resolve(getElement(root, id));
  }

  const normalizedExtra: ExtraUnresolvedBindingSpec = extra ?? {};
  for (const key in normalizedExtra) {
    providers[key] = (root: ShadowRoot) => normalizedExtra[key].resolve(getElement(root, id));
  }
  return providers as unknown as ResolvedBindingSpecProvider<ReversedSpec<S['host']&{}> & X>;
}