import {Type, undefinedType, unionType} from 'gs-types';
import {of, OperatorFunction, pipe} from 'rxjs';
import {switchMap, tap} from 'rxjs/operators';

import {Reference} from '../types/ctrl';
import {ApiType, IOType, OValue} from '../types/io';
import {retryWhenDefined} from '../util/retry-when-defined';
import {createMissingValueObservableError, getValueObservable} from '../util/value-observable';


class ResolvedOValue<T, P extends string> implements Reference<OValue<T, P>> {
  readonly apiType = ApiType.VALUE;
  readonly ioType = IOType.OUTPUT;

  constructor(
      readonly defaultValue: T,
      readonly key: P,
      readonly valueType: Type<T>,
  ) {}

  resolve(target: HTMLElement): () => OperatorFunction<T, T> {
    return () => pipe(
        switchMap(newValue => {
          return of(newValue).pipe(
              tap(newValue => {
                const value$ = getValueObservable(target, this.key);
                if (!value$) {
                  throw createMissingValueObservableError(target, this.key);
                }
                value$?.next(newValue);
              }),
              retryWhenDefined(target.tagName),
          );
        }),
    );
  }
}

export function ovalue<T, P extends string>(
    key: P,
    valueType: Type<T>,
    startValue: T,
): ResolvedOValue<T, P>;
export function ovalue<T, P extends string>(
    key: P,
    valueType: Type<T>,
): ResolvedOValue<T|undefined, P>;
export function ovalue(key: string, valueType: Type<unknown>, defaultValue?: unknown): ResolvedOValue<unknown, string> {
  if (defaultValue !== undefined) {
    return new ResolvedOValue(defaultValue, key, valueType);
  }

  return new ResolvedOValue(defaultValue, key, unionType([valueType, undefinedType]));
}
