import { combineLatest, Observable } from '@rxjs';
import { tap } from '@rxjs/operators';

import { Output } from '../types/output';
import { Resolver } from '../types/resolver';
import { ShadowRootLike } from '../types/shadow-root-like';
import { UnresolvedElementProperty } from '../types/unresolved-element-property';

export class TextContentOutput implements Output<string> {
  constructor(
      private readonly resolver: Resolver<Element>,
  ) { }

  output(root: ShadowRootLike, valueObs: Observable<string>): Observable<unknown> {
    return combineLatest(this.resolver(root), valueObs)
        .pipe(tap(([el, value]) => el.textContent = value));
  }
}

class UnresolvedTextContentOutput implements
    UnresolvedElementProperty<Element, TextContentOutput> {
  resolve(resolver: Resolver<Element>): TextContentOutput {
    return new TextContentOutput(resolver);
  }
}

export function textContent(): UnresolvedTextContentOutput {
  return new UnresolvedTextContentOutput();
}
