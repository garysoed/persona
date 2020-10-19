import { defer, EMPTY, merge, Observable, of as observableOf } from 'rxjs';
import { switchMapTo, tap } from 'rxjs/operators';

import { PersonaContext } from '../core/persona-context';

import { __id, NodeWithId } from './node-with-id';


export function renderTextNode(
    text$: Observable<string>,
    id: any,
    context: PersonaContext,
): Observable<NodeWithId> {
  return defer(() => {
    const ownerDocument = context.shadowRoot.ownerDocument;
    if (!ownerDocument) {
      throw new Error('No owner documents found');
    }
    const node = Object.assign(ownerDocument.createTextNode(''), {[__id]: id});

    const onChange$ = text$.pipe(
        tap(text => {
          node.textContent = text;
        }),
        switchMapTo(EMPTY),
    );

    return merge(onChange$, observableOf(node));
  });
}
