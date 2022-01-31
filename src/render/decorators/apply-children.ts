import {$asArray, $filterNonNull, $pipe, diffArray} from 'gs-tools/export/collect';
import {combineLatest, Observable, of as observableOf} from 'rxjs';
import {map, switchMap, tap} from 'rxjs/operators';

import {getContiguousChildNodesWithId} from '../../util/contiguous-nodes-with-id';
import {render} from '../render';
import {equalNodes, NodeWithId} from '../types/node-with-id';
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
      tap(nodes => {
        const existingNodes = getContiguousChildNodesWithId(el);
        const diffs = diffArray(existingNodes, nodes, equalNodes);
        for (const diff of diffs) {
          switch (diff.type) {
            case 'delete':
              el.removeChild(diff.value);
              break;
            case 'insert': {
              const insertBefore = existingNodes[diff.index];
              el.insertBefore(diff.value, insertBefore);
              break;
            }
          }
        }
      }),
  );
}