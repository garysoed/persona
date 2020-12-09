import {Observable} from 'rxjs';

import {PersonaContext} from '../core/persona-context';

import {NodeWithId} from './node-with-id';
import {renderCustomElement} from './render-custom-element';
import {renderDocumentFragment} from './render-document-fragment';
import {renderElement} from './render-element';
import {renderHtml} from './render-html';
import {renderTextNode} from './render-text-node';
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
