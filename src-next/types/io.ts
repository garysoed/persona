import {Type} from 'gs-types';

export enum IOType {
  INPUT,
  OUTPUT,
}

export enum ApiType {
  ATTR,
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
    IValue<unknown>|OValue<unknown>;