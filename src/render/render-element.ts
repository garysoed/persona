import { arrayFrom } from 'gs-tools/export/collect';
import { diffArray, MapDiff } from 'gs-tools/export/rxjs';
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

  readonly children?: Observable<readonly Node[]>;

  /**
   * Text content of the element.
   */
  readonly textContent?: Observable<string>;
}

/**
 * Renders an element given the tag name, attribute, and text content.
 *
 * @param tagName - Tag name of the element to create.
 * @param values - Values to set to the element.
 * @param context - The Persona context.
 * @returns `Observable` that emits the created custom element. This only emits when the element is
 *     created and will not emit if any of the element's properties changes.
 *
 * @thModule render.
 */
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

        const children$ = values.children || observableOf([]);
        onChange$List.push(children$.pipe(
            diffArray(),
            tap(diff => {
              switch (diff.type) {
                case 'delete':
                  el.removeChild(diff.value);
                  break;
                case 'init':
                  el.innerHTML = '';
                  for (const child of diff.value) {
                    el.appendChild(child);
                  }
                  break;
                case 'insert':
                  const insertBefore = el.children.item(diff.index);
                  el.insertBefore(diff.value, insertBefore);
                  break;
                case 'set':
                  const toDelete = el.children.item(diff.index);
                  const setBefore = toDelete?.nextSibling || null;
                  if (toDelete) {
                    el.removeChild(toDelete);
                  }
                  el.insertBefore(diff.value, setBefore);
                  break;
              }
            }),
        ));

        return merge(
            observableOf(el),
            merge(...onChange$List).pipe(switchMapTo(EMPTY)),
        );
      }),
  );
}