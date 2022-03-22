import {iattr} from '../input/attr';
import {icall} from '../input/call';
import {iclass} from '../input/class';
import {ievent} from '../input/event';
import {iflag} from '../input/flag';
import {islotted} from '../input/slotted';
import {itext} from '../input/text';
import {ivalue} from '../input/value';
import {oattr} from '../output/attr';
import {ocall} from '../output/call';
import {oclass} from '../output/class';
import {oevent} from '../output/event';
import {oflag} from '../output/flag';
import {otext} from '../output/text';
import {ovalue} from '../output/value';
import {ResolvedBindingSpec} from '../types/ctrl';
import {ApiType, IAttr, ICall, IClass, IEvent, IFlag, InputOutput, IOType, ISlotted, IValue, OAttr, OCall, OClass, OEvent, OFlag, OSlotted, OValue} from '../types/io';


type ReversedIO<T> =
    T extends IAttr ? OAttr :
    T extends OAttr ? IAttr :
    T extends ICall<infer A, infer M> ? OCall<A, M> :
    T extends IClass ? OClass :
    T extends OClass ? IClass :
    T extends OEvent<infer E> ? IEvent<E> :
    T extends IFlag ? OFlag :
    T extends OFlag ? IFlag :
    T extends ISlotted ? OSlotted :
    T extends OSlotted ? ISlotted :
    T extends IValue<infer V, infer P> ? OValue<V, P> :
    T extends OValue<infer V, infer P> ? IValue<V, P> :
    never;

export type ReversedSpec<U extends ResolvedBindingSpec> = ResolvedBindingSpec & {
  readonly [K in keyof U]: ReversedIO<U[K]>;
};

export function reverseSpec<U extends ResolvedBindingSpec>(spec: U): ReversedSpec<U> {
  const reversed: Partial<Record<keyof U, any>> = {};

  for (const key in spec) {
    reversed[key] = reverseIO(spec[key]);
  }
  return reversed as ReversedSpec<U>;
}

function reverseIO<T extends InputOutput>(io: T): ReversedIO<T>;
function reverseIO(io: InputOutput): InputOutput {
  switch (io.apiType) {
    case ApiType.ATTR:
      switch (io.ioType) {
        case IOType.INPUT:
          return oattr(io.attrName);
        case IOType.OUTPUT:
          return iattr(io.attrName);
      }
      break;
    case ApiType.CALL:
      switch (io.ioType) {
        case IOType.INPUT:
          return ocall(io.methodName, io.argType);
        case IOType.OUTPUT:
          return icall(io.methodName, io.argType);
      }
      break;
    case ApiType.CASE:
      throw new Error(`Unsupported reversal for ${io.apiType}`);
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
          return oevent(io.eventName, io.eventType);
        case IOType.OUTPUT:
          return ievent(io.eventName, io.eventType, {matchTarget: true});
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
    case ApiType.FOREACH:
      throw new Error(`Unsupported reversal for ${io.apiType}`);
    case ApiType.KEYDOWN:
      throw new Error(`Unsupported reversal for ${io.apiType}`);
    case ApiType.MEDIA:
      throw new Error(`Unsupported reversal for ${io.apiType}`);
    case ApiType.RECT:
      throw new Error(`Unsupported reversal for ${io.apiType}`);
    case ApiType.SLOTTED:
      switch (io.ioType) {
        case IOType.INPUT:
          throw new Error(`Unsupported reversal for ${io.apiType} - ${io.ioType}`);
        case IOType.OUTPUT:
          return islotted();
      }
      break;
    case ApiType.STYLE:
      throw new Error(`Unsupported reversal for ${io.apiType}`);
    case ApiType.TARGET:
      throw new Error(`Unsupported reversal for ${io.apiType}`);
    case ApiType.TEXT:
      switch (io.ioType) {
        case IOType.INPUT:
          return otext();
        case IOType.OUTPUT:
          return itext();
      }
      break;
    case ApiType.VALUE:
      switch (io.ioType) {
        case IOType.INPUT:
          return ovalue(io.key, io.valueType, io.defaultValue);
        case IOType.OUTPUT:
          return ivalue(io.key, io.valueType, io.defaultValue);
      }
  }
}