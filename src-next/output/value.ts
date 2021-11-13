import {Type, undefinedType, unionType} from 'gs-types';
import {OperatorFunction} from 'rxjs';
import {tap} from 'rxjs/operators';

import {Resolved, UnresolvedIO} from '../types/ctrl';
import {ApiType, IOType, OValue} from '../types/io';
import {getValueObservable} from '../util/value-observable';


class ResolvedOValue<T> implements Resolved<UnresolvedOValue<T>> {
  readonly apiType = ApiType.VALUE;
  readonly ioType = IOType.OUTPUT;

  constructor(
      readonly defaultValue: T,
      readonly key: string,
      readonly target: HTMLElement,
      readonly valueType: Type<T>,
  ) {}

  update(): OperatorFunction<T, unknown> {
    return tap(newValue => {
      const value$ = getValueObservable(this.target, this.key);
      value$?.next(newValue);
    });
  }
}

export class UnresolvedOValue<T> implements UnresolvedIO<OValue<T>> {
  readonly apiType = ApiType.VALUE;
  readonly ioType = IOType.OUTPUT;

  constructor(
      readonly defaultValue: T,
      readonly key: string,
      readonly valueType: Type<T>,
  ) {}

  resolve(target: HTMLElement): ResolvedOValue<T> {
    return new ResolvedOValue(
        this.defaultValue,
        this.key,
        target,
        this.valueType,
    );
  }
}

export function ovalue<T>(key: string, valueType: Type<T>, startValue: T): UnresolvedOValue<T>;
export function ovalue<T>(key: string, valueType: Type<T>): UnresolvedOValue<T|undefined>;
export function ovalue(key: string, valueType: Type<unknown>, defaultValue?: unknown): UnresolvedOValue<unknown> {
  if (defaultValue !== undefined) {
    return new UnresolvedOValue(defaultValue, key, valueType);
  }

  return new UnresolvedOValue(defaultValue, key, unionType([valueType, undefinedType]));
}
