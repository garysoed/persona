import { combineLatest, Observable } from '@rxjs';
import { tap } from '@rxjs/operators';

import { Output } from '../types/output';
import { UnresolvedElementProperty } from '../types/unresolved-element-property';

export class InnerHtmlOutput implements Output<string> {
  constructor(private readonly resolver: (root: ShadowRoot) => Observable<Element>) { }

  output(root: ShadowRoot, valueObs: Observable<string>): Observable<unknown> {
    return combineLatest(this.resolver(root), valueObs)
        .pipe(
            tap(([el, value]) => el.innerHTML = value),
        );
  }
}

class UnresolvedInnerHtmlOutput implements UnresolvedElementProperty<Element, InnerHtmlOutput> {
  resolve(resolver: (root: ShadowRoot) => Observable<Element>): InnerHtmlOutput {
    return new InnerHtmlOutput(resolver);
  }
}

export function innerHtml(): UnresolvedInnerHtmlOutput {
  return new UnresolvedInnerHtmlOutput();
}
