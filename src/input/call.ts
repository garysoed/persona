import {Type} from 'gs-types';
import {defer, Observable, throwError} from 'rxjs';
import {map} from 'rxjs/operators';

import {ApiType, ICall, IOType} from '../types/io';
import {retryWhenDefined} from '../util/retry-when-defined';
import {createMissingValueObservableError, getValueObservable} from '../util/value-observable';


class ResolvedICall<T, M extends string> implements ICall<T, M> {
  readonly apiType = ApiType.CALL;
  readonly ioType = IOType.INPUT;

  constructor(
      readonly methodName: M,
      readonly argType: Type<T>,
  ) {}

  resolve(target: HTMLElement): Observable<T> {
    // Defer so we have time to upgrade the dependencies
    return defer(() => {
      const value$ = getValueObservable(target, this.methodName);
      if (!value$) {
        return throwError(createMissingValueObservableError(target, this.methodName));
      }

      return value$;
    })
        .pipe(
            retryWhenDefined(target.tagName),
            map(value => {
              if (!this.argType.check(value)) {
                throw new Error(`Arg of method ${this.methodName} is not of type ${this.argType}`);
              }

              return value;
            }),
        );
  }
}

export function icall<T, M extends string>(methodName: M, argType: Type<T>): ResolvedICall<T, M> {
  return new ResolvedICall(methodName, argType);
}
