import {Type, undefinedType, unionType} from 'gs-types';
import {of, OperatorFunction, pipe} from 'rxjs';
import {switchMap, tap} from 'rxjs/operators';

import {ApiType, IOType, OValue} from '../types/io';
import {retryWhenDefined} from '../util/retry-when-defined';
import {createMissingValueObservableError, getValueObservable} from '../util/value-observable';


class ResolvedOValue<T, P extends string> implements OValue<T, P> {
  readonly apiType = ApiType.VALUE;
  readonly ioType = IOType.OUTPUT;

  constructor(
      readonly defaultValueProvider: () => T,
      readonly key: P,
      readonly valueType: Type<T>,
  ) {}

  resolve(target: Element): () => OperatorFunction<T, T> {
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
    defaultValueProvider: () => T,
): ResolvedOValue<T, P>;
export function ovalue<T, P extends string>(
    key: P,
    valueType: Type<T>,
): ResolvedOValue<T|undefined, P>;
export function ovalue(
    key: string,
    valueType: Type<unknown>,
    defaultValueProvider?: () => unknown,
): ResolvedOValue<unknown, string> {
  if (defaultValueProvider !== undefined) {
    return new ResolvedOValue(defaultValueProvider, key, valueType);
  }

  return new ResolvedOValue(() => undefined, key, unionType([valueType, undefinedType]));
}
