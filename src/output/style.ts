import {OperatorFunction, pipe} from 'rxjs';
import {tap} from 'rxjs/operators';

import {Resolved, UnresolvedIO} from '../types/ctrl';
import {ApiType, IOType, OStyle} from '../types/io';


class ResolvedOStyle<S extends keyof CSSStyleDeclaration> implements Resolved<UnresolvedOStyle<S>> {
  readonly apiType = ApiType.STYLE;
  readonly ioType = IOType.OUTPUT;

  constructor(
      readonly propertyName: S,
      readonly target: HTMLElement,
  ) {}

  update(): OperatorFunction<CSSStyleDeclaration[S], unknown> {
    return pipe(
        tap(newValue => {
          this.target.style[this.propertyName] = newValue;
        }),
    );
  }
}

class UnresolvedOStyle<S extends keyof CSSStyleDeclaration> implements UnresolvedIO<OStyle<S>> {
  readonly apiType = ApiType.STYLE;
  readonly ioType = IOType.OUTPUT;

  constructor(
      readonly propertyName: S,
  ) {}

  resolve(target: HTMLElement): ResolvedOStyle<S> {
    return new ResolvedOStyle(this.propertyName, target);
  }
}

export function ostyle<S extends keyof CSSStyleDeclaration>(propertyName: S): UnresolvedOStyle<S> {
  return new UnresolvedOStyle<S>(propertyName);
}
