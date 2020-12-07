import {Observable} from 'rxjs';

import {PersonaContext, renderCustomElement, renderDocumentFragment, renderElement, renderHtml, renderTextNode} from '../../export';

import {NodeWithId} from './node-with-id';
import {RenderSpec} from './types/render-spec';
import {RenderSpecType} from './types/render-spec-type';


export function render(
    spec: RenderSpec,
    context: PersonaContext,
): Observable<NodeWithId<Node>|null> {
  switch (spec.type) {
    case RenderSpecType.CUSTOM_ELEMENT:
      return renderCustomElement(spec, context);
    case RenderSpecType.ELEMENT:
      return renderElement(spec, context);
    case RenderSpecType.FRAGMENT:
      return renderDocumentFragment(spec, context);
    case RenderSpecType.HTML:
      return renderHtml(spec, context);
    case RenderSpecType.TEXT_NODE:
      return renderTextNode(spec, context);
  }
}
