import {instanceofType, Type} from 'gs-types';
import {OperatorFunction} from 'rxjs';
import {tap} from 'rxjs/operators';

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
    const method = (this.target as MaybeHtmlElement)[this.methodName];
    if (!instanceofType(Function).check(method)) {
      throw new Error(`Property ${this.methodName} is not a function`);
    }
    return tap(newValue => {
      method.call(this.target, newValue);
    });
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
