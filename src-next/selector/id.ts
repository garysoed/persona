import {iattr} from '../input/attr';
import {iclass} from '../input/class';
import {ievent} from '../input/event';
import {iflag} from '../input/flag';
import {ivalue} from '../input/value';
import {oattr} from '../output/attr';
import {oclass} from '../output/class';
import {oevent} from '../output/event';
import {oflag} from '../output/flag';
import {ovalue} from '../output/value';
import {ResolvedBindingSpecProvider, ResolvedProvider, Spec, UnresolvedBindingSpec, UnresolvedIO} from '../types/ctrl';
import {ApiType, IAttr, IClass, IEvent, IFlag, InputOutput, IOType, IValue, OAttr, OClass, OEvent, OFlag, OSingle, OValue} from '../types/io';
import {Registration} from '../types/registration';

type ReversedIO<T> =
    T extends IAttr ? OAttr :
    T extends OAttr ? IAttr :
    T extends IClass ? OClass :
    T extends OClass ? IClass :
    T extends OEvent ? IEvent :
    T extends IFlag ? OFlag :
    T extends OFlag ? IFlag :
    T extends IValue<infer V> ? OValue<V> :
    T extends OValue<infer V> ? IValue<V> :
    never;

type ReversedSpec<U extends UnresolvedBindingSpec> = UnresolvedBindingSpec & {
  readonly [K in keyof U]: ReversedIO<U[K]>;
};

type RegistrationWithSpec<S extends Spec> = Pick<Registration<HTMLElement, S>, 'spec'>;

type ReversableIO =
    IAttr|OAttr|
    IClass|OClass|
    OEvent|IEvent|
    IFlag|OFlag|
    OSingle|
    IValue<any>|OValue<any>;

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
function reverseIO(io: ReversableIO): InputOutput {
  switch (io.apiType) {
    case ApiType.ATTR:
      switch (io.ioType) {
        case IOType.INPUT:
          return oattr(io.attrName);
        case IOType.OUTPUT:
          return iattr(io.attrName);
      }
      break;
    case ApiType.CLASS:
      switch (io.ioType) {
        case IOType.INPUT:
          return oclass(io.className);
        case IOType.OUTPUT:
          return iclass(io.className);
      }
      break;
    case ApiType.EVENT:
      switch (io.ioType) {
        case IOType.INPUT:
          return oevent(io.eventName);
        case IOType.OUTPUT:
          return ievent(io.eventName);
      }
      break;
    case ApiType.FLAG:
      switch (io.ioType) {
        case IOType.INPUT:
          return oflag(io.attrName);
        case IOType.OUTPUT:
          return iflag(io.attrName);
      }
      break;
    case ApiType.SINGLE:
      throw new Error(`Unsupported reversal for ${io.apiType}`);
    case ApiType.VALUE:
      switch (io.ioType) {
        case IOType.INPUT:
          return ovalue(io.key, io.valueType, io.defaultValue);
        case IOType.OUTPUT:
          return ivalue(io.key, io.valueType, io.defaultValue);
      }
  }
}


export type ExtraUnresolvedBindingSpec = Record<
    string,
    UnresolvedIO<IAttr>|UnresolvedIO<OAttr>|
    UnresolvedIO<IClass>|UnresolvedIO<OClass>|
    UnresolvedIO<IEvent>|
    UnresolvedIO<IFlag>|UnresolvedIO<OFlag>|
    UnresolvedIO<OSingle>
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
  const providers: Partial<Record<string, ResolvedProvider<InputOutput>>> = {};
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