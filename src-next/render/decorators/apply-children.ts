import {$asArray, $filterNonNull, $pipe, arrayFrom} from 'gs-tools/export/collect';
import {diffArray} from 'gs-tools/export/rxjs';
import {combineLatest, Observable, of as observableOf} from 'rxjs';
import {map, switchMap, tap} from 'rxjs/operators';

import {render} from '../render';
import {NodeWithId} from '../types/node-with-id';
import {RenderContext} from '../types/render-context';
import {RenderSpec} from '../types/render-spec';

import {Decorator} from './apply-decorators';


export function applyChildren(
    children$: Observable<readonly RenderSpec[]>,
    context: RenderContext,
): Decorator<NodeWithId<Element|DocumentFragment>> {
  return el => children$.pipe(
      switchMap(specs => {
        const renderedNode$list = specs.map(spec => render(spec, context));
        if (renderedNode$list.length <= 0) {
          return observableOf([]);
        }

        return combineLatest(renderedNode$list).pipe(
            map(renderedNodes => $pipe(renderedNodes, $filterNonNull(), $asArray())),
        );
      }),
      diffArray(),
      tap(diff => {
        switch (diff.type) {
          case 'delete':
            el.removeChild(diff.value);
            break;
          case 'init':
            for (const child of arrayFrom(el.children)) {
              el.removeChild(child);
            }

            for (const child of diff.value) {
              el.appendChild(child);
            }
            break;
          case 'insert':{
            const insertBefore = el.children.item(diff.index);
            el.insertBefore(diff.value, insertBefore);
            break;
          }
          case 'set':{
            const toDelete = el.children.item(diff.index);
            const setBefore = toDelete?.nextSibling || null;
            if (toDelete) {
              el.removeChild(toDelete);
            }
            el.insertBefore(diff.value, setBefore);
            break;
          }
        }
      }),
  );
}