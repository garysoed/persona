import {Observable} from 'rxjs';

import {ShadowContext} from '../core/shadow-context';
import {UnresolvedSpec} from '../main/api';

import {NodeWithId} from './node-with-id';
import {renderCustomElement} from './render-custom-element';
import {renderDocumentFragment} from './render-document-fragment';
import {renderElement} from './render-element';
import {renderHtml} from './render-html';
import {renderNode} from './render-node';
import {renderTextNode} from './render-text-node';
import {RenderCustomElementSpec} from './types/render-custom-element-spec';
import {RenderElementSpec} from './types/render-element-spec';
import {RenderFragmentSpec} from './types/render-fragment-spec';
import {RenderHtmlSpec} from './types/render-html-spec';
import {RenderNodeSpec} from './types/render-node-spec';
import {RenderSpec} from './types/render-spec';
import {RenderSpecType} from './types/render-spec-type';
import {RenderTextNodeSpec} from './types/render-text-node-spec';


export function render(spec: RenderCustomElementSpec<UnresolvedSpec>, context: ShadowContext): Observable<NodeWithId<Element>>;
export function render(spec: RenderElementSpec, context: ShadowContext): Observable<NodeWithId<Element>>;
export function render(spec: RenderFragmentSpec, context: ShadowContext): Observable<NodeWithId<DocumentFragment>>;
export function render(spec: RenderHtmlSpec, context: ShadowContext): Observable<NodeWithId<Element>>;
export function render(spec: RenderNodeSpec<Node>, context: ShadowContext): Observable<NodeWithId<Node>>;
export function render(spec: RenderTextNodeSpec, context: ShadowContext): Observable<NodeWithId<Text>>;
export function render(spec: RenderSpec, context: ShadowContext): Observable<NodeWithId<Node>|null>;
export function render(spec: RenderSpec, context: ShadowContext): Observable<NodeWithId<Node>|null> {
  switch (spec.type) {
    case RenderSpecType.CUSTOM_ELEMENT:
      return renderCustomElement(spec, context);
    case RenderSpecType.ELEMENT:
      return renderElement(spec, context);
    case RenderSpecType.FRAGMENT:
      return renderDocumentFragment(spec, context);
    case RenderSpecType.HTML:
      return renderHtml(spec, context);
    case RenderSpecType.NODE:
      return renderNode(spec);
    case RenderSpecType.TEXT_NODE:
      return renderTextNode(spec, context);
  }
}
