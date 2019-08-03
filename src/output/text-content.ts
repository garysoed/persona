import { combineLatest, Observable } from '@rxjs';
import { tap } from '@rxjs/operators';

import { Output } from '../types/output';
import { UnresolvedElementProperty } from '../types/unresolved-element-property';

export class TextContentOutput implements Output<string> {
  constructor(
      private readonly resolver: (root: ShadowRoot) => Observable<Element>,
  ) { }

  output(root: ShadowRoot, valueObs: Observable<string>): Observable<unknown> {
    return combineLatest(this.resolver(root), valueObs)
        .pipe(tap(([el, value]) => el.textContent = value));
  }
}

class UnresolvedTextContentOutput implements
    UnresolvedElementProperty<Element, TextContentOutput> {
  resolve(resolver: (root: ShadowRoot) => Observable<Element>): TextContentOutput {
    return new TextContentOutput(resolver);
  }
}

export function textContent(): UnresolvedTextContentOutput {
  return new UnresolvedTextContentOutput();
}
