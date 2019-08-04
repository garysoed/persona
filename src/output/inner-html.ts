import { combineLatest, Observable } from '@rxjs';
import { tap } from '@rxjs/operators';

import { Output } from '../types/output';
import { Resolver } from '../types/resolver';
import { ShadowRootLike } from '../types/shadow-root-like';
import { UnresolvedElementProperty } from '../types/unresolved-element-property';

export class InnerHtmlOutput implements Output<string> {
  constructor(private readonly resolver: Resolver<Element>) { }

  output(root: ShadowRootLike, valueObs: Observable<string>): Observable<unknown> {
    return combineLatest(this.resolver(root), valueObs)
        .pipe(
            tap(([el, value]) => el.innerHTML = value),
        );
  }
}

class UnresolvedInnerHtmlOutput implements UnresolvedElementProperty<Element, InnerHtmlOutput> {
  resolve(resolver: Resolver<Element>): InnerHtmlOutput {
    return new InnerHtmlOutput(resolver);
  }
}

export function innerHtml(): UnresolvedInnerHtmlOutput {
  return new UnresolvedInnerHtmlOutput();
}
