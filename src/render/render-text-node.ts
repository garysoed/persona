import { defer, EMPTY, merge, Observable, of as observableOf } from 'rxjs';
import { map, switchMapTo, tap } from 'rxjs/operators';

import { PersonaContext } from '../core/persona-context';

export function renderTextNode(
    text$: Observable<string>,
    context: PersonaContext,
): Observable<Node> {
  return defer(() => {
    const node = context.shadowRoot.ownerDocument.createTextNode('');

    const onChange$ = text$.pipe(
        tap(text => {
          node.textContent = text;
        }),
        switchMapTo(EMPTY),
    );

    return merge(onChange$, observableOf(node));
  });
}
