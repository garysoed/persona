import {tupleOfType} from 'gs-types';
import {defer, Observable, throwError} from 'rxjs';
import {map} from 'rxjs/operators';

import {ApiType, ICall, IOType, TypeOfArray} from '../types/io';
import {retryWhenDefined} from '../util/retry-when-defined';
import {createMissingValueObservableError, getValueObservable} from '../util/value-observable';


class ResolvedICall<T extends readonly unknown[], M extends string> implements ICall<T, M> {
  readonly apiType = ApiType.CALL;
  readonly ioType = IOType.INPUT;

  constructor(
      readonly methodName: M,
      readonly argTypes: TypeOfArray<T>,
  ) {}

  resolve(target: Element): Observable<T> {
    const argType = tupleOfType<T>(this.argTypes);
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
              if (!argType.check(value)) {
                throw new Error(`Arg of method ${this.methodName} is not of type ${argType}`);
              }

              return value;
            }),
        );
  }
}


export function icall<A extends readonly unknown[], M extends string>(
    methodName: M,
    argTypes: TypeOfArray<A>,
): ResolvedICall<A, M> {
  return new ResolvedICall(methodName, argTypes);
}
