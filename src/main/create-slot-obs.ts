import { $filter, $head, $pipe, createImmutableList, ImmutableList } from '@gs-tools/collect';
import { Observable } from '@rxjs';
import { map, startWith, switchMap } from '@rxjs/operators';
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
        map(childNodes => findCommentNode(createImmutableList(childNodes), slotName)),
    );
}

function findCommentNode(
    childNodes: ImmutableList<Node>,
    commentContent: string,
): Node|null {
  return $pipe(
      childNodes,
      $filter(node => {
        return node.nodeName === '#comment' &&
            !!node.nodeValue &&
            node.nodeValue.trim() === commentContent;
      }),
      $head(),
  ) || null;
}