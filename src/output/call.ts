import {instanceofType, Type} from 'gs-types';
import {of, OperatorFunction, pipe} from 'rxjs';
import {switchMap, tap} from 'rxjs/operators';

import {Resolved, UnresolvedIO} from '../types/ctrl';
import {ApiType, IOType, OCall} from '../types/io';
import {retryWhenDefined} from '../util/retry-when-defined';


interface MaybeHtmlElement extends HTMLElement {
  readonly [key: string]: unknown;
}


class ResolvedOCall<T, M extends string> implements Resolved<UnresolvedOCall<T, M>> {
  readonly apiType = ApiType.CALL;
  readonly ioType = IOType.OUTPUT;

  constructor(
      readonly methodName: M,
      readonly argType: Type<T>,
      readonly target: HTMLElement,
  ) {}

  update(): OperatorFunction<T, T> {
    return pipe(
        switchMap(newValue => {
          return of(newValue).pipe(
              tap(newValue => {
                const method = (this.target as MaybeHtmlElement)[this.methodName];
                if (!instanceofType(Function).check(method)) {
                  throw new Error(`Property ${this.methodName} is not a function`);
                }

                method.call(this.target, newValue);
              }),
              retryWhenDefined(this.target.tagName),
          );
        }),
    );
  }
}

class UnresolvedOCall<T, M extends string> implements UnresolvedIO<OCall<T, M>> {
  readonly apiType = ApiType.CALL;
  readonly ioType = IOType.OUTPUT;

  constructor(
      readonly methodName: M,
      readonly argType: Type<T>,
  ) {}

  resolve(target: HTMLElement): ResolvedOCall<T, M> {
    return new ResolvedOCall(this.methodName, this.argType, target);
  }
}

export function ocall<T, M extends string>(methodName: M, argType: Type<T>): UnresolvedOCall<T, M> {
  return new UnresolvedOCall(methodName, argType);
}
