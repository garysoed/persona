import {Observable} from 'rxjs';

import {renderNode} from './render-node';
import {NodeWithId} from './types/node-with-id';
import {RenderNodeSpec} from './types/render-node-spec';
import {RenderSpec} from './types/render-spec';
import {RenderSpecType} from './types/render-spec-type';


// export function render(spec: RenderCustomElementSpec<UnresolvedSpec>, context: ShadowContext): Observable<NodeWithId<Element>>;
// export function render(spec: RenderElementSpec, context: ShadowContext): Observable<NodeWithId<Element>>;
// export function render(spec: RenderFragmentSpec, context: ShadowContext): Observable<NodeWithId<DocumentFragment>>;
// export function render(spec: RenderHtmlSpec, context: ShadowContext): Observable<NodeWithId<Element>>;
export function render(spec: RenderNodeSpec<Node>): Observable<NodeWithId<Node>>;
// export function render(spec: RenderTextNodeSpec, context: ShadowContext): Observable<NodeWithId<Text>>;
// export function render(spec: RenderSpec, context: ShadowContext): Observable<NodeWithId<Node>|null>;
export function render(spec: RenderSpec): Observable<NodeWithId<Node>|null> {
  switch (spec.type) {
    // case RenderSpecType.CUSTOM_ELEMENT:
    //   return renderCustomElement(spec, context);
    // case RenderSpecType.ELEMENT:
    //   return renderElement(spec, context);
    // case RenderSpecType.FRAGMENT:
    //   return renderDocumentFragment(spec, context);
    // case RenderSpecType.HTML:
    //   return renderHtml(spec, context);
    case RenderSpecType.NODE:
      return renderNode(spec);
    // case RenderSpecType.TEXT_NODE:
    //   return renderTextNode(spec, context);
    default:
      throw new Error(`Unimplemented: render ${spec.type}`);
  }
}
