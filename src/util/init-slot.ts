import {$filter, $first, arrayFrom} from 'gs-tools/export/collect';
import {$pipe} from 'gs-tools/export/typescript';
import {OperatorFunction, pipe} from 'rxjs';
import {map, startWith, switchMap} from 'rxjs/operators';

import {Target} from '../types/target';

import {mutationObservable} from './mutation-observable';

export function initSlot(
  slotName: string | null,
): OperatorFunction<Target, Node | null> {
  return pipe(
    switchMap((parentEl) => {
      return mutationObservable(parentEl, {childList: true}).pipe(
        map(() => parentEl.childNodes),
        startWith(parentEl.childNodes),
      );
    }),
    map((childNodes) => {
      if (!slotName) {
        return null;
      }
      return findCommentNode(arrayFrom(childNodes), slotName);
    }),
  );
}

function findCommentNode(
  childNodes: readonly Node[],
  commentContent: string,
): Node | null {
  return (
    $pipe(
      childNodes,
      $filter((node) => {
        return (
          node.nodeName === '#comment' &&
          !!node.nodeValue &&
          node.nodeValue.trim() === commentContent
        );
      }),
      $first(),
    ) || null
  );
}
