import {Type} from 'gs-types';

export enum IOType {
  INPUT,
  OUTPUT,
}

export enum ApiType {
  VARIABLE,
}


export interface IVariable<T> {
  readonly apiType: ApiType.VARIABLE;
  readonly ioType: IOType.INPUT;
  readonly valueType: Type<T>;
  readonly defaultValue: T;
}

export interface OVariable<T> {
  readonly apiType: ApiType.VARIABLE;
  readonly ioType: IOType.OUTPUT;
  readonly valueType: Type<T>;
  readonly defaultValue: T;
}

export type InputOutput = IVariable<unknown>|OVariable<unknown>;