import { arrayFrom } from 'gs-tools/export/collect';
import { diffMap } from 'gs-tools/export/rxjs';
import { assertUnreachable } from 'gs-tools/export/typescript';
import { merge, Observable, of as observableOf } from 'rxjs';
import { tap } from 'rxjs/operators';

import { RenderSpec } from './render-spec';


export class SimpleElementRenderSpec implements RenderSpec {
  constructor(
      private readonly tagName: string,
      private readonly attrs$: Observable<ReadonlyMap<string, string>> = observableOf(new Map()),
      private readonly innerText$: Observable<string> = observableOf(''),
  ) { }

  canReuseElement(element: HTMLElement): boolean {
    return element.tagName.toLowerCase() === this.tagName;
  }

  createElement(): HTMLElement {
    return document.createElement(this.tagName);
  }

  registerElement(element: HTMLElement): Observable<unknown> {
    const updateAttribute$ = this.attrs$.pipe(
        diffMap(),
        tap(diff => {
          switch (diff.type) {
            case 'delete':
              element.removeAttribute(diff.key);
              break;
            case 'set':
              element.setAttribute(diff.key, diff.value);
              break;
            case 'init':
              // Goes through every attribute, and delete them.
              for (const attr of arrayFrom(element.attributes)) {
                element.removeAttribute(attr.name);
              }

              for (const [key, value] of diff.value) {
                element.setAttribute(key, value);
              }
              break;
            default:
              assertUnreachable(diff);
          }
        }),
    );

    const updateInnerText$ = this.innerText$.pipe(
        tap(innerText => {
          element.textContent = innerText;
        }),
    );

    return merge(updateAttribute$, updateInnerText$);
  }
}
