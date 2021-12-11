import {instanceofType, Type} from 'gs-types';
import {BehaviorSubject, defer, from, of, OperatorFunction, pipe, throwError} from 'rxjs';
import {retryWhen, switchMapTo, tap, withLatestFrom} from 'rxjs/operators';

import {Resolved, UnresolvedIO} from '../types/ctrl';
import {ApiType, IOType, OCall} from '../types/io';


interface MaybeHtmlElement extends HTMLElement {
  readonly [key: string]: unknown;
}


class ResolvedOCall<T> implements Resolved<UnresolvedOCall<T>> {
  readonly apiType = ApiType.CALL;
  readonly ioType = IOType.OUTPUT;

  constructor(
      readonly methodName: string,
      readonly argType: Type<T>,
      readonly target: HTMLElement,
  ) {}

  update(): OperatorFunction<T, unknown> {
    const method$ = defer(() => {
      const method = (this.target as MaybeHtmlElement)[this.methodName];
      if (!instanceofType(Function).check(method)) {
        return throwError(new Error(`Property ${this.methodName} is not a function`));
      }

      return of(method);
    })
        .pipe(
            retryWhen(() => {
              return from(
                  window.customElements.whenDefined(this.target.tagName.toLowerCase()),
              )
                  .pipe(switchMapTo(new BehaviorSubject({})));
            }),
        );
    // Defer so we have time to upgrade the dependencies
    return pipe(
        withLatestFrom(method$),
        tap(([newValue, method]) => {
          method.call(this.target, newValue);
        }),
    );
  }
}

class UnresolvedOCall<T> implements UnresolvedIO<OCall<T>> {
  readonly apiType = ApiType.CALL;
  readonly ioType = IOType.OUTPUT;

  constructor(
      readonly methodName: string,
      readonly argType: Type<T>,
  ) {}

  resolve(target: HTMLElement): ResolvedOCall<T> {
    return new ResolvedOCall(this.methodName, this.argType, target);
  }
}

export function ocall(methodName: string, argType: Type<unknown>): UnresolvedOCall<unknown> {
  return new UnresolvedOCall(methodName, argType);
}
