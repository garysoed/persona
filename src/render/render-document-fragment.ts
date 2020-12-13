import {Observable} from 'rxjs';

import {RenderSpecType} from '../../export';
import {PersonaContext} from '../core/persona-context';

import {NodeWithId} from './node-with-id';
import {renderNode} from './render-node';
import {RenderFragmentSpec} from './types/render-fragment-spec';


export function renderDocumentFragment(
    spec: RenderFragmentSpec,
    context: PersonaContext,
): Observable<NodeWithId<DocumentFragment>> {
  return renderNode({
    ...spec,
    type: RenderSpecType.NODE,
    node: context.shadowRoot.ownerDocument.createDocumentFragment(),
  });
}
