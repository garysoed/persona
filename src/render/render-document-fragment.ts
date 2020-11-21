import {Observable, of as observableOf} from 'rxjs';

import {PersonaContext} from '../core/persona-context';

export function renderDocumentFragment(context: PersonaContext): Observable<Node> {
  return observableOf(context.shadowRoot.ownerDocument.createDocumentFragment());
}
