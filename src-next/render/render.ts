import {Observable} from 'rxjs';

import {renderCustomElement} from './render-custom-element';
import {renderElement} from './render-element';
import {renderHtml} from './render-html';
import {renderNode} from './render-node';
import {renderTextNode} from './render-text-node';
import {NodeWithId} from './types/node-with-id';
import {RenderContext} from './types/render-context';
import {RenderElementSpec} from './types/render-element-spec';
import {RenderHtmlSpec} from './types/render-html-spec';
import {RenderNodeSpec} from './types/render-node-spec';
import {RenderSpec} from './types/render-spec';
import {RenderSpecType} from './types/render-spec-type';
import {RenderTextNodeSpec} from './types/render-text-node-spec';


// export function render(spec: RenderCustomElementSpec<UnresolvedSpec>, context: ShadowContext): Observable<NodeWithId<Element>>;
export function render(spec: RenderElementSpec, context: RenderContext): Observable<NodeWithId<Element>>;
export function render(spec: RenderHtmlSpec, context: RenderContext): Observable<NodeWithId<Element>>;
export function render(spec: RenderNodeSpec<Node>, context: RenderContext): Observable<NodeWithId<Node>>;
export function render(spec: RenderTextNodeSpec, context: RenderContext): Observable<NodeWithId<Text>>;
export function render(spec: RenderSpec, context: RenderContext): Observable<NodeWithId<Node>|null>;
export function render(spec: RenderSpec, context: RenderContext): Observable<NodeWithId<Node>|null> {
  switch (spec.type) {
    case RenderSpecType.CUSTOM_ELEMENT:
      return renderCustomElement(spec, context);
    case RenderSpecType.ELEMENT:
      return renderElement(spec, context);
    case RenderSpecType.HTML:
      return renderHtml(spec, context);
    case RenderSpecType.NODE:
      return renderNode(spec);
    case RenderSpecType.TEXT_NODE:
      return renderTextNode(spec, context);
  }
}
