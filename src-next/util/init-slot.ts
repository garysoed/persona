import {$filter, $first, $pipe, arrayFrom} from 'gs-tools/export/collect';
import {OperatorFunction, pipe} from 'rxjs';
import {map, startWith, switchMap} from 'rxjs/operators';

import {Selectable} from '../types/selectable';

import {mutationObservable} from './mutation-observable';


export function initSlot(slotName: string): OperatorFunction<Selectable, Node|null> {
  return pipe(
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
        return node.nodeName === '#comment'
            && !!node.nodeValue
            && node.nodeValue.trim() === commentContent;
      }),
      $first(),
  ) || null;
}
