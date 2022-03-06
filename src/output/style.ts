import {OperatorFunction, pipe} from 'rxjs';
import {tap} from 'rxjs/operators';

import {Resolved, UnresolvedIO} from '../types/ctrl';
import {ApiType, IOType, OStyle} from '../types/io';

type StringPropertyKeys<S> = {
  readonly [K in keyof S]: S[K] extends string ? K : never;
}[keyof S];

class ResolvedOStyle<S extends StringPropertyKeys<CSSStyleDeclaration>> implements Resolved<UnresolvedOStyle<S>> {
  readonly apiType = ApiType.STYLE;
  readonly ioType = IOType.OUTPUT;

  constructor(
      readonly propertyName: S,
      readonly target: HTMLElement,
  ) {}

  update(): OperatorFunction<string, string> {
    return pipe(
        tap(newValue => {
          this.target.style[this.propertyName] = newValue;
        }),
    );
  }
}

class UnresolvedOStyle<S extends StringPropertyKeys<CSSStyleDeclaration>> implements UnresolvedIO<HTMLElement, OStyle<S>> {
  readonly apiType = ApiType.STYLE;
  readonly ioType = IOType.OUTPUT;

  constructor(
      readonly propertyName: S,
  ) {}

  resolve(target: HTMLElement): ResolvedOStyle<S> {
    return new ResolvedOStyle(this.propertyName, target);
  }
}

export function ostyle<S extends StringPropertyKeys<CSSStyleDeclaration>>(propertyName: S): UnresolvedOStyle<S> {
  return new UnresolvedOStyle<S>(propertyName);
}
