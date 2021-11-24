import {Observable} from 'rxjs';

import {renderElement} from './render-element';
import {renderNode} from './render-node';
import {renderTextNode} from './render-text-node';
import {NodeWithId} from './types/node-with-id';
import {RenderNodeSpec} from './types/render-node-spec';
import {RenderSpec} from './types/render-spec';
import {RenderSpecType} from './types/render-spec-type';
import {RenderTextNodeSpec} from './types/render-text-node-spec';


// export function render(spec: RenderCustomElementSpec<UnresolvedSpec>, context: ShadowContext): Observable<NodeWithId<Element>>;
// export function render(spec: RenderElementSpec, context: ShadowContext): Observable<NodeWithId<Element>>;
// export function render(spec: RenderHtmlSpec, context: ShadowContext): Observable<NodeWithId<Element>>;
export function render(spec: RenderNodeSpec<Node>, document: Document): Observable<NodeWithId<Node>>;
export function render(spec: RenderTextNodeSpec, document: Document): Observable<NodeWithId<Text>>;
export function render(spec: RenderSpec, document: Document): Observable<NodeWithId<Node>|null>;
export function render(spec: RenderSpec, document: Document): Observable<NodeWithId<Node>|null> {
  switch (spec.type) {
    // case RenderSpecType.CUSTOM_ELEMENT:
    //   return renderCustomElement(spec, context);
    case RenderSpecType.ELEMENT:
      return renderElement(spec, document);
    // case RenderSpecType.HTML:
    //   return renderHtml(spec, context);
    case RenderSpecType.NODE:
      return renderNode(spec);
    case RenderSpecType.TEXT_NODE:
      return renderTextNode(spec, document);
  }
}
