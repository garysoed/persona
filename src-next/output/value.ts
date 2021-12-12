import {Type, undefinedType, unionType} from 'gs-types';
import {of, OperatorFunction, pipe} from 'rxjs';
import {switchMap, tap} from 'rxjs/operators';

import {Resolved, UnresolvedIO} from '../types/ctrl';
import {ApiType, IOType, OValue} from '../types/io';
import {retryWhenDefined} from '../util/retry-when-defined';
import {createMissingValueObservableError, getValueObservable} from '../util/value-observable';


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
    return pipe(
        switchMap(newValue => {
          return of(newValue).pipe(
              tap(newValue => {
                const value$ = getValueObservable(this.target, this.key);
                if (!value$) {
                  throw createMissingValueObservableError(this.target, this.key);
                }
                value$?.next(newValue);
              }),
              retryWhenDefined(this.target.tagName),
          );
        }),
    );
  }
}

class UnresolvedOValue<T> implements UnresolvedIO<OValue<T>> {
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
