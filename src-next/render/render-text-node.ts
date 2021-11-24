import {defer, Observable} from 'rxjs';

import {Decorator} from './decorators/apply-decorators';
import {applyTextContent} from './decorators/apply-text-content';
import {renderNode} from './render-node';
import {NodeWithId} from './types/node-with-id';
import {RenderSpecType} from './types/render-spec-type';
import {RenderTextNodeSpec} from './types/render-text-node-spec';


export function renderTextNode(
    spec: RenderTextNodeSpec,
    document: Document,
): Observable<NodeWithId<Text>> {
  return defer(() => {
    const node = document.createTextNode('');

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
