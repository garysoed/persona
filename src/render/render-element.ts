import { arrayFrom } from 'gs-tools/export/collect';
import { MapDiff } from 'gs-tools/export/rxjs';
import { assertUnreachable } from 'gs-tools/export/typescript';
import { EMPTY, merge, Observable, of as observableOf } from 'rxjs';
import { switchMap, switchMapTo, tap } from 'rxjs/operators';

import { PersonaContext } from '../core/persona-context';
import { ownerDocument } from '../input/owner-document';

/**
 * Values for rendering the element.
 *
 * @thHidden
 */
export interface Values {
  /**
   * Attributes to apply to the element.
   */
  readonly attrs?: ReadonlyMap<string, Observable<string>>;

  /**
   * Text content of the element.
   */
  readonly textContent?: Observable<string>;
}

export function renderElement(
    tagName: string,
    values: Values,
    context: PersonaContext,
): Observable<HTMLElement> {
  return ownerDocument().getValue(context).pipe(
      switchMap(document => {
        const el = document.createElement(tagName);
        const onChange$List = [];

        const extraAttrs = values.attrs || new Map<string, Observable<string>>();
        for (const [attrName, attrValue$] of extraAttrs) {
          onChange$List.push(attrValue$.pipe(
              tap(value => {
                el.setAttribute(attrName, value);
              }),
          ));
        }

        const textContent$ = values.textContent || observableOf('');
        onChange$List.push(textContent$.pipe(
            tap(text => {
              el.textContent = text;
            }),
        ));

        return merge(
            observableOf(el),
            merge(...onChange$List).pipe(switchMapTo(EMPTY)),
        );
      }),
  );
}
