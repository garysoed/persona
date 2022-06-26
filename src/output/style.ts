import {OperatorFunction, pipe} from 'rxjs';
import {tap} from 'rxjs/operators';

import {ApiType, IOType, OStyle} from '../types/io';
import {Target} from '../types/target';


type StringPropertyKeys<S> = {
  readonly [K in keyof S]: S[K] extends string ? K : never;
}[keyof S];

class ResolvedOStyle<S extends StringPropertyKeys<CSSStyleDeclaration>> implements OStyle<S> {
  readonly apiType = ApiType.STYLE;
  readonly ioType = IOType.OUTPUT;

  constructor(
      readonly propertyName: S,
  ) {}

  resolve(target: Target&ElementCSSInlineStyle): () => OperatorFunction<string, string> {
    return () => pipe(
        tap(newValue => {
          target.style[this.propertyName] = newValue;
        }),
    );
  }
}

export function ostyle<S extends StringPropertyKeys<CSSStyleDeclaration>>(propertyName: S): ResolvedOStyle<S> {
  return new ResolvedOStyle<S>(propertyName);
}
