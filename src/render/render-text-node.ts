import { EMPTY, Observable, defer, merge, of as observableOf } from 'rxjs';
import { switchMapTo, tap } from 'rxjs/operators';

import { PersonaContext } from '../core/persona-context';

import { NodeWithId, __id } from './node-with-id';


export function renderTextNode(
    text$: Observable<string>,
    id: unknown,
    context: PersonaContext,
): Observable<NodeWithId<Text>> {
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
