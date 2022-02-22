import {defer, Observable} from 'rxjs';

import {Decorator} from './decorators/apply-decorators';
import {applyTextContent} from './decorators/apply-text-content';
import {renderNode} from './render-node';
import {RenderContext} from './types/render-context';
import {RenderSpecType} from './types/render-spec-type';
import {RenderTextNodeSpec} from './types/render-text-node-spec';


export function renderTextNode(
    spec: RenderTextNodeSpec,
    context: RenderContext,
): Observable<Text> {
  return defer(() => {
    const node = context.document.createTextNode('');

    const decorators: Array<Decorator<Text>> = [applyTextContent(spec.textContent)];
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
