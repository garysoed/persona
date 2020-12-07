import {Observable, of as observableOf} from 'rxjs';

import {PersonaContext} from '../core/persona-context';

import {NodeWithId} from './node-with-id';
import {setId} from './set-id';
import {RenderFragmentSpec} from './types/render-fragment-spec';

export function renderDocumentFragment(
    spec: RenderFragmentSpec,
    context: PersonaContext,
): Observable<NodeWithId<DocumentFragment>> {
  return observableOf(setId(context.shadowRoot.ownerDocument.createDocumentFragment(), spec.id));
}
