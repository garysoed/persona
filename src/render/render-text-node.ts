import {defer, EMPTY, merge, Observable} from 'rxjs';
import {switchMapTo, tap} from 'rxjs/operators';

import {PersonaContext} from '../core/persona-context';

import {NodeWithId} from './node-with-id';
import {renderNode} from './render-node';
import {normalize} from './types/observable-or-value';
import {RenderSpecType} from './types/render-spec-type';
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
    const node = ownerDocument.createTextNode('');

    const onChange$ = normalize(spec.text).pipe(
        tap(text => {
          node.textContent = text;
        }),
        switchMapTo(EMPTY),
    );

    return merge(
        onChange$,
        renderNode({
          ...spec,
          type: RenderSpecType.NODE,
          node,
        }),
    );
  });
}
