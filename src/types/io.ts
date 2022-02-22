import {Type} from 'gs-types';
import {Observable} from 'rxjs';

import {RenderSpec} from '../../export';

import {KeyMatchOptions} from './key-match-options';

export enum IOType {
  INPUT,
  OUTPUT,
}

export enum ApiType {
  ATTR,
  CALL,
  CASE,
  CLASS,
  EVENT,
  FLAG,
  FOREACH,
  KEYDOWN,
  MEDIA,
  MULTI,
  RECT,
  SINGLE,
  SLOTTED,
  STYLE,
  TARGET,
  TEXT,
  VALUE,
}

export type RenderValueFn<T> = (value: T) => Observable<RenderSpec|null>;
export type RenderValuesFn<T> = (value: T, index: number) => Observable<RenderSpec>;

export interface IAttr {
  readonly apiType: ApiType.ATTR;
  readonly ioType: IOType.INPUT;
  readonly attrName: string;
}

export interface OAttr {
  readonly apiType: ApiType.ATTR;
  readonly ioType: IOType.OUTPUT;
  readonly attrName: string;
}

export interface ICall<T, M extends string> {
  readonly apiType: ApiType.CALL;
  readonly ioType: IOType.INPUT;
  readonly methodName: M;
  readonly argType: Type<T>;
}

export interface OCall<T, M extends string> {
  readonly apiType: ApiType.CALL;
  readonly ioType: IOType.OUTPUT;
  readonly methodName: M;
  readonly argType: Type<T>;
}

export interface OCase<T> {
  readonly apiType: ApiType.CASE;
  readonly ioType: IOType.OUTPUT;
  readonly slotName: string|null;
  readonly valueType: Type<T>;
}

export interface IClass {
  readonly apiType: ApiType.CLASS;
  readonly ioType: IOType.INPUT;
  readonly className: string;
}

export interface OClass {
  readonly apiType: ApiType.CLASS;
  readonly ioType: IOType.OUTPUT;
  readonly className: string;
}

export interface EventCtor<E extends Event> {
  new (...args: readonly any[]): E;
}

export interface IEvent<E extends Event> {
  readonly apiType: ApiType.EVENT;
  readonly ioType: IOType.INPUT;
  readonly eventName: string;
  readonly eventType: EventCtor<E>;
}

export interface OEvent<E extends Event> {
  readonly apiType: ApiType.EVENT;
  readonly ioType: IOType.OUTPUT;
  readonly eventName: string;
  readonly eventType: EventCtor<E>;
}

export interface IFlag {
  readonly apiType: ApiType.FLAG;
  readonly ioType: IOType.INPUT;
  readonly attrName: string;
}

export interface OFlag {
  readonly apiType: ApiType.FLAG;
  readonly ioType: IOType.OUTPUT;
  readonly attrName: string;
}

export interface OForeach<T> {
  readonly apiType: ApiType.FOREACH;
  readonly ioType: IOType.OUTPUT;
  readonly slotName: string;
  readonly valueType: Type<T>;
}


export interface IKeydown {
  readonly apiType: ApiType.KEYDOWN;
  readonly ioType: IOType.INPUT;
  readonly key: string;
  readonly matchOptions: KeyMatchOptions;
}

export interface IMedia {
  readonly apiType: ApiType.MEDIA;
  readonly ioType: IOType.INPUT;
  readonly query: string;
}

export interface OMulti {
  readonly apiType: ApiType.MULTI;
  readonly ioType: IOType.OUTPUT;
  readonly slotName: string;
}

export interface IRect {
  readonly apiType: ApiType.RECT;
  readonly ioType: IOType.INPUT;
}

export interface OSingle {
  readonly apiType: ApiType.SINGLE;
  readonly ioType: IOType.OUTPUT;
  readonly slotName: string|null;
}

export interface ISlotted {
  readonly apiType: ApiType.SLOTTED;
  readonly ioType: IOType.INPUT;
}

export interface OSlotted {
  readonly apiType: ApiType.SLOTTED;
  readonly ioType: IOType.OUTPUT;
}

export interface OStyle<S extends keyof CSSStyleDeclaration> {
  readonly apiType: ApiType.STYLE;
  readonly ioType: IOType.OUTPUT;
  readonly propertyName: S;
}

export interface ITarget {
  readonly apiType: ApiType.TARGET;
  readonly ioType: IOType.INPUT;
}

export interface IText {
  readonly apiType: ApiType.TEXT;
  readonly ioType: IOType.INPUT;
}

export interface OText {
  readonly apiType: ApiType.TEXT;
  readonly ioType: IOType.OUTPUT;
}

export interface IValue<T, P extends string> {
  readonly apiType: ApiType.VALUE;
  readonly ioType: IOType.INPUT;
  readonly defaultValue: T;
  readonly key: P;
  readonly valueType: Type<T>;
}

export interface OValue<T, P extends string> {
  readonly apiType: ApiType.VALUE;
  readonly ioType: IOType.OUTPUT;
  readonly valueType: Type<T>;
  readonly key: P;
  readonly defaultValue: T;
}

export type Resolver = (host: HTMLElement) => HTMLElement;

export type InputOutput =
    IAttr|OAttr|
    ICall<unknown, string>|OCall<unknown, string>|
    OCase<unknown>|
    IClass|OClass|
    IEvent<Event>|OEvent<Event>|
    IFlag|OFlag|
    OForeach<unknown>|
    IKeydown|
    IMedia|
    OMulti|
    IRect|
    OSingle|
    ISlotted|OSlotted|
    OStyle<keyof CSSStyleDeclaration>|
    ITarget|
    IText|OText|
    IValue<unknown, string>|OValue<unknown, string>;