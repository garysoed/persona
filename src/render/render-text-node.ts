import {defer, EMPTY, merge, Observable, of as observableOf} from 'rxjs';
import {switchMapTo, tap} from 'rxjs/operators';

import {PersonaContext} from '../core/persona-context';

import {NodeWithId, __id} from './node-with-id';
import {normalize} from './types/observable-or-value';
import {RenderTextNodeSpec} from './types/render-text-node-spec';


export function renderTextNode(
    spec: RenderTextNodeSpec,
    context: PersonaContext,
): Observable<NodeWithId<Text>> {
  return defer(() => {
    const ownerDocument = context.shadowRoot.ownerDocument;
    if (!ownerDocument) {
      throw new Error('No owner documents found');
    }
    const node = Object.assign(ownerDocument.createTextNode(''), {[__id]: spec.id});

    const onChange$ = normalize(spec.text).pipe(
        tap(text => {
          node.textContent = text;
        }),
        switchMapTo(EMPTY),
    );

    return merge(onChange$, observableOf(node));
  });
}
