import { combineLatest, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { Output } from '../types/output';
import { Resolver } from '../types/resolver';
import { ShadowRootLike } from '../types/shadow-root-like';
import { UnresolvedElementProperty } from '../types/unresolved-element-property';

export class StyleOutput<S extends keyof CSSStyleDeclaration>
    implements Output<CSSStyleDeclaration[S]> {
  constructor(
      readonly resolver: Resolver<HTMLElement>,
      readonly styleKey: S,
  ) { }

  output(root: ShadowRootLike, valueObs: Observable<CSSStyleDeclaration[S]>): Observable<unknown> {
    return combineLatest(
            this.resolver(root),
            valueObs,
        )
        .pipe(
            tap(([el, value]) => {
              el.style[this.styleKey] = value;
            }),
        );
  }
}

class UnresolvedStyleOutput<S extends keyof CSSStyleDeclaration> implements
    UnresolvedElementProperty<HTMLElement, StyleOutput<S>> {
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
