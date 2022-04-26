import {instanceofType} from 'gs-types';
import {of, OperatorFunction, pipe} from 'rxjs';
import {switchMap, tap} from 'rxjs/operators';

import {ApiType, IOType, OCall, TypeOfArray} from '../types/io';
import {retryWhenDefined} from '../util/retry-when-defined';


interface MaybeElement extends Element {
  readonly [key: string]: unknown;
}


class ResolvedOCall<A extends readonly unknown[], M extends string> implements OCall<A, M> {
  readonly apiType = ApiType.CALL;
  readonly ioType = IOType.OUTPUT;

  constructor(
      readonly methodName: M,
      readonly argTypes: TypeOfArray<A>,
  ) {}

  resolve(target: Element): () => OperatorFunction<A, A> {
    return () => pipe(
        switchMap(newValue => {
          return of(newValue).pipe(
              tap(newValue => {
                const method = (target as MaybeElement)[this.methodName];
                if (!instanceofType(Function).check(method)) {
                  throw new Error(`Property ${this.methodName} is not a function`);
                }

                method.call(target, ...newValue);
              }),
              retryWhenDefined(target.tagName),
          );
        }),
    );
  }
}


export function ocall<A extends readonly unknown[], M extends string>(
    methodName: M,
    argTypes: TypeOfArray<A>,
): ResolvedOCall<A, M> {
  return new ResolvedOCall(methodName, argTypes);
}
