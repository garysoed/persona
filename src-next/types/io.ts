import {Type} from 'gs-types';

import {KeyMatchOptions} from './key-match-options';

export enum IOType {
  INPUT,
  OUTPUT,
}

export enum ApiType {
  ATTR,
  CLASS,
  EVENT,
  FLAG,
  KEYDOWN,
  MULTI,
  SINGLE,
  VALUE,
}

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

export interface IEvent {
  readonly apiType: ApiType.EVENT;
  readonly ioType: IOType.INPUT;
  readonly eventName: string;
}

export interface OEvent {
  readonly apiType: ApiType.EVENT;
  readonly ioType: IOType.OUTPUT;
  readonly eventName: string;
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

export interface IKeydown {
  readonly apiType: ApiType.KEYDOWN;
  readonly ioType: IOType.INPUT;
  readonly key: string;
  readonly matchOptions: KeyMatchOptions;
}

export interface OMulti {
  readonly apiType: ApiType.MULTI;
  readonly ioType: IOType.OUTPUT;
  readonly slotName: string;
}

export interface OSingle {
  readonly apiType: ApiType.SINGLE;
  readonly ioType: IOType.OUTPUT;
  readonly slotName: string|null;
}

export interface IValue<T> {
  readonly apiType: ApiType.VALUE;
  readonly ioType: IOType.INPUT;
  readonly defaultValue: T;
  readonly key: string;
  readonly valueType: Type<T>;
}

export interface OValue<T> {
  readonly apiType: ApiType.VALUE;
  readonly ioType: IOType.OUTPUT;
  readonly valueType: Type<T>;
  readonly key: string;
  readonly defaultValue: T;
}

export type Resolver = (host: HTMLElement) => HTMLElement;

export type InputOutput =
    IAttr|OAttr|
    IClass|OClass|
    IEvent|OEvent|
    IFlag|OFlag|
    IKeydown|
    OMulti|
    OSingle|
    IValue<unknown>|OValue<unknown>;