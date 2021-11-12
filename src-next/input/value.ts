import {Type, undefinedType, unionType} from 'gs-types';
import {Observable, throwError, defer} from 'rxjs';
import {map} from 'rxjs/operators';

import {Resolved, UnresolvedIO} from '../types/ctrl';
import {ApiType, IOType, IValue} from '../types/io';
import {getValueObservable} from '../util/value-observable';

class ResolvedIValue<T> implements Resolved<T, UnresolvedIValue<T>> {
  readonly apiType = ApiType.VALUE;
  readonly ioType = IOType.INPUT;

  constructor(
      readonly defaultValue: T,
      readonly key: string,
      readonly target: HTMLElement,
      readonly valueType: Type<T>,
  ) {}

  get value$(): Observable<T> {
    // Defer so we have time to upgrade the dependencies
    return defer(() => {
      const value$ = getValueObservable(this.target, this.key);
      if (!value$) {
        return throwError(new Error(`Target ${this.target} has no observable value ${this.key}`));
      }

      return value$;
    })
        .pipe(
            map(value => value ?? this.defaultValue),
            map(value => {
              if (!this.valueType.check(value)) {
                throw new Error(`Value of key ${this.key} is not of type ${this.valueType}`);
              }

              return value;
            }),
        );
  }
}

export class UnresolvedIValue<T> implements UnresolvedIO<T, IValue<T>> {
  readonly apiType = ApiType.VALUE;
  readonly ioType = IOType.INPUT;

  constructor(
      readonly defaultValue: T,
      readonly key: string,
      readonly valueType: Type<T>,
  ) {}

  resolve(target: HTMLElement): ResolvedIValue<T> {
    return new ResolvedIValue(
        this.defaultValue,
        this.key,
        target,
        this.valueType,
    );
  }
}

export function ivalue<T>(key: string, valueType: Type<T>, defaultValue: T): UnresolvedIValue<T>;
export function ivalue<T>(key: string, valueType: Type<T>): UnresolvedIValue<T|undefined>;
export function ivalue(key: string, valueType: Type<unknown>, defaultValue?: unknown): UnresolvedIValue<unknown> {
  if (defaultValue !== undefined) {
    return new UnresolvedIValue(defaultValue, key, valueType);
  }

  return new UnresolvedIValue(defaultValue, key, unionType([valueType, undefinedType]));
}