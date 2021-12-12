import {Type} from 'gs-types';
import {defer, Observable, throwError} from 'rxjs';
import {map} from 'rxjs/operators';

import {Resolved, UnresolvedIO} from '../types/ctrl';
import {ApiType, ICall, IOType} from '../types/io';
import {retryWhenDefined} from '../util/retry-when-defined';
import {createMissingValueObservableError, getValueObservable} from '../util/value-observable';


class ResolvedICall<T> implements Resolved<UnresolvedICall<T>> {
  readonly apiType = ApiType.CALL;
  readonly ioType = IOType.INPUT;

  constructor(
      readonly target: HTMLElement,
      readonly methodName: string,
      readonly argType: Type<T>,
  ) {}

  get value$(): Observable<T> {
    // Defer so we have time to upgrade the dependencies
    return defer(() => {
      const value$ = getValueObservable(this.target, this.methodName);
      if (!value$) {
        return throwError(createMissingValueObservableError(this.target, this.methodName));
      }

      return value$;
    })
        .pipe(
            retryWhenDefined(this.target.tagName),
            map(value => {
              if (!this.argType.check(value)) {
                throw new Error(`Arg of method ${this.methodName} is not of type ${this.argType}`);
              }

              return value;
            }),
        );
  }
}

class UnresolvedICall<T> implements UnresolvedIO<ICall<T>> {
  readonly apiType = ApiType.CALL;
  readonly ioType = IOType.INPUT;

  constructor(
      readonly methodName: string,
      readonly argType: Type<T>,
  ) {}

  resolve(target: HTMLElement): ResolvedICall<T> {
    return new ResolvedICall(target, this.methodName, this.argType);
  }
}

export function icall<T>(methodName: string, argType: Type<T>): UnresolvedICall<T> {
  return new UnresolvedICall(methodName, argType);
}
