import {instanceofType, Type} from 'gs-types';
import {of, OperatorFunction, pipe} from 'rxjs';
import {switchMap, tap} from 'rxjs/operators';

import {ApiType, IOType, OCall} from '../types/io';
import {retryWhenDefined} from '../util/retry-when-defined';


interface MaybeElement extends Element {
  readonly [key: string]: unknown;
}


class ResolvedOCall<T, M extends string> implements OCall<T, M> {
  readonly apiType = ApiType.CALL;
  readonly ioType = IOType.OUTPUT;

  constructor(
      readonly methodName: M,
      readonly argType: Type<T>,
  ) {}

  resolve(target: Element): () => OperatorFunction<T, T> {
    return () => pipe(
        switchMap(newValue => {
          return of(newValue).pipe(
              tap(newValue => {
                const method = (target as MaybeElement)[this.methodName];
                if (!instanceofType(Function).check(method)) {
                  throw new Error(`Property ${this.methodName} is not a function`);
                }

                method.call(target, newValue);
              }),
              retryWhenDefined(target.tagName),
          );
        }),
    );
  }
}

export function ocall<T, M extends string>(methodName: M, argType: Type<T>): ResolvedOCall<T, M> {
  return new ResolvedOCall(methodName, argType);
}
