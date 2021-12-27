import {Type, undefinedType, unionType} from 'gs-types';
import {defer, Observable, throwError} from 'rxjs';
import {map} from 'rxjs/operators';

import {Resolved, UnresolvedIO} from '../types/ctrl';
import {ApiType, IOType, IValue} from '../types/io';
import {retryWhenDefined} from '../util/retry-when-defined';
import {createMissingValueObservableError, getValueObservable} from '../util/value-observable';


class ResolvedIValue<T, P extends string> implements Resolved<UnresolvedIValue<T, P>> {
  readonly apiType = ApiType.VALUE;
  readonly ioType = IOType.INPUT;

  constructor(
      readonly defaultValue: T,
      readonly key: P,
      readonly target: HTMLElement,
      readonly valueType: Type<T>,
  ) {}

  get value$(): Observable<T> {
    // Defer so we have time to upgrade the dependencies
    return defer(() => {
      const value$ = getValueObservable(this.target, this.key);
      if (!value$) {
        return throwError(createMissingValueObservableError(this.target, this.key));
      }

      return value$;
    })
        .pipe(
            retryWhenDefined(this.target.tagName),
            map(value => {
              if (!this.valueType.check(value)) {
                throw new Error(`Value of key ${this.key} is not of type ${this.valueType}`);
              }

              return value;
            }),
        );
  }
}

export class UnresolvedIValue<T, P extends string> implements UnresolvedIO<IValue<T, P>> {
  readonly apiType = ApiType.VALUE;
  readonly ioType = IOType.INPUT;

  constructor(
      readonly defaultValue: T,
      readonly key: P,
      readonly valueType: Type<T>,
  ) {}

  resolve(target: HTMLElement): ResolvedIValue<T, P> {
    return new ResolvedIValue(
        this.defaultValue,
        this.key,
        target,
        this.valueType,
    );
  }
}

export function ivalue<T, P extends string>(
    key: P,
    valueType: Type<T>,
    defaultValue: T,
): UnresolvedIValue<T, P>;
export function ivalue<T, P extends string>(
    key: P,
    valueType: Type<T>,
): UnresolvedIValue<T|undefined, P>;
export function ivalue(key: string, valueType: Type<unknown>, defaultValue?: unknown): UnresolvedIValue<unknown, string> {
  if (defaultValue !== undefined) {
    return new UnresolvedIValue(defaultValue, key, valueType);
  }

  return new UnresolvedIValue(defaultValue, key, unionType([valueType, undefinedType]));
}
