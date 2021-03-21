import {defer, Observable} from 'rxjs';

import {PersonaContext} from '../core/persona-context';

import {Decorator} from './decorators/apply-decorators';
import {applyTextContent} from './decorators/apply-text-content';
import {NodeWithId} from './node-with-id';
import {renderNode} from './render-node';
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

    const decorators: Array<Decorator<NodeWithId<Text>>> = [applyTextContent(spec.textContent)];
    if (spec.decorators) {
      decorators.push(...spec.decorators);
    }

    return renderNode({
      ...spec,
      type: RenderSpecType.NODE,
      node,
      decorators,
    });
  });
}
