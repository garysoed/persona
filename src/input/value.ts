import {Type, undefinedType, unionType} from 'gs-types';
import {defer, Observable, throwError} from 'rxjs';
import {map} from 'rxjs/operators';

import {ApiType, IOType, IValue} from '../types/io';
import {retryWhenDefined} from '../util/retry-when-defined';
import {
  createMissingValueObservableError,
  getValueObservable,
} from '../util/value-observable';

class ResolvedIValue<T, P extends string> implements IValue<T, P> {
  readonly apiType = ApiType.VALUE;
  readonly ioType = IOType.INPUT;

  constructor(
    readonly defaultValueProvider: () => T,
    readonly key: P,
    readonly valueType: Type<T>,
  ) {}

  resolve(target: Element): Observable<T> {
    // Defer so we have time to upgrade the dependencies
    return defer(() => {
      const value$ = getValueObservable(target, this.key);
      if (!value$) {
        return throwError(createMissingValueObservableError(target, this.key));
      }

      return value$;
    }).pipe(
      retryWhenDefined(target.tagName),
      map((value) => {
        if (!this.valueType.check(value)) {
          throw new Error(
            `Value of key ${this.key} is not of type ${this.valueType}`,
          );
        }

        return value;
      }),
    );
  }
}

export function ivalue<T, P extends string>(
  key: P,
  valueType: Type<T>,
  defaultValueProvider: () => T,
): ResolvedIValue<T, P>;
export function ivalue<T, P extends string>(
  key: P,
  valueType: Type<T>,
): ResolvedIValue<T | undefined, P>;
export function ivalue(
  key: string,
  valueType: Type<unknown>,
  defaultValueProvider?: () => unknown,
): ResolvedIValue<unknown, string> {
  if (defaultValueProvider !== undefined) {
    return new ResolvedIValue(defaultValueProvider, key, valueType);
  }

  return new ResolvedIValue(
    () => undefined,
    key,
    unionType([valueType, undefinedType]),
  );
}
