import { $filter, $first, $pipe, arrayFrom } from 'gs-tools/export/collect';
import { Observable } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';

import { mutationObservable } from '../util/mutation-observable';

export function createSlotObs(
    parentElObs: Observable<Element>,
    slotName: string,
): Observable<Node|null> {
return parentElObs
    .pipe(
        switchMap(parentEl => {
          return mutationObservable(parentEl, {childList: true})
              .pipe(
                  map(() => parentEl.childNodes),
                  startWith(parentEl.childNodes),
              );
        }),
        map(childNodes => findCommentNode(arrayFrom(childNodes), slotName)),
    );
}

function findCommentNode(
    childNodes: readonly Node[],
    commentContent: string,
): Node|null {
  return $pipe(
      childNodes,
      $filter(node => {
        return node.nodeName === '#comment' &&
            !!node.nodeValue &&
            node.nodeValue.trim() === commentContent;
      }),
      $first(),
  ) || null;
}
