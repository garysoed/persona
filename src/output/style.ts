import {OperatorFunction} from 'rxjs';
import {tap} from 'rxjs/operators';

import {ShadowContext} from '../core/shadow-context';
import {Output} from '../types/output';
import {Resolver} from '../types/resolver';
import {UnresolvedOutput} from '../types/unresolved-output';


export class StyleOutput<S extends keyof CSSStyleDeclaration> implements Output<CSSStyleDeclaration[S]> {
  readonly type = 'out';

  constructor(
      readonly resolver: Resolver<HTMLElement>,
      readonly styleKey: S,
  ) { }

  output(context: ShadowContext): OperatorFunction<CSSStyleDeclaration[S], unknown> {
    return value$ => value$
        .pipe(
            tap(value => {
              const el = this.resolver(context);
              el.style[this.styleKey] = value;
            }),
        );
  }
}

class UnresolvedStyleOutput<S extends keyof CSSStyleDeclaration> implements UnresolvedOutput<Element, CSSStyleDeclaration[S]> {
  constructor(
      private readonly styleKey: S,
  ) { }

  resolve(resolver: Resolver<HTMLElement>): StyleOutput<S> {
    return new StyleOutput(resolver, this.styleKey);
  }
}

export function style<S extends keyof CSSStyleDeclaration>(
    styleKey: S,
): UnresolvedStyleOutput<S> {
  return new UnresolvedStyleOutput(styleKey);
}
