import { combineLatest, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Output, UnresolvedElementPropertyOutput } from '../component/output';

export class InnerHtmlOutput implements Output<string> {
  constructor(private readonly resolver: (root: ShadowRoot) => Observable<Element>) { }

  output(root: ShadowRoot, valueObs: Observable<string>): Observable<unknown> {
    return combineLatest(this.resolver(root), valueObs)
        .pipe(
            tap(([el, value]) => el.innerHTML = value),
        );
  }
}

class UnresolvedInnerHtmlOutput implements UnresolvedElementPropertyOutput<Element, string> {
  resolve(resolver: (root: ShadowRoot) => Observable<Element>): InnerHtmlOutput {
    return new InnerHtmlOutput(resolver);
  }
}

export function innerHtml(): UnresolvedInnerHtmlOutput {
  return new UnresolvedInnerHtmlOutput();
}
