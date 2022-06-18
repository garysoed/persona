import {Observable} from 'rxjs';

import {ResolvedBindingSpec} from '../types/ctrl';

import {ElementForType, ParserSupportedType} from './html-parse-service';
import {renderElement} from './render-element';
import {renderFragment} from './render-fragment';
import {renderHtml} from './render-html';
import {renderNode} from './render-node';
import {renderTemplate} from './render-template';
import {renderTextNode} from './render-text-node';
import {RenderContext} from './types/render-context';
import {RenderElementSpec} from './types/render-element-spec';
import {RenderFragmentSpec} from './types/render-fragment-spec';
import {RenderHtmlSpec} from './types/render-html-spec';
import {RenderNodeSpec} from './types/render-node-spec';
import {RenderSpec} from './types/render-spec';
import {RenderSpecType} from './types/render-spec-type';
import {RenderTemplateSpec, TemplateBindingSpec} from './types/render-template-spec';
import {RenderTextNodeSpec} from './types/render-text-node-spec';


export function render(spec: RenderElementSpec<ResolvedBindingSpec, {}>, context: RenderContext): Observable<Element>;
export function render(spec: RenderFragmentSpec, context: RenderContext): Observable<DocumentFragment>;
export function render<T extends ParserSupportedType>(
    spec: RenderHtmlSpec<T>, context: RenderContext): Observable<ElementForType<T>>;
export function render(spec: RenderNodeSpec<Node>, context: RenderContext): Observable<Node>;
export function render(spec: RenderTextNodeSpec, context: RenderContext): Observable<Text>;
export function render(spec: RenderSpec, context: RenderContext): Observable<Node|null>;
export function render(spec: RenderTemplateSpec<TemplateBindingSpec>, context: RenderContext): Observable<Node>;
export function render(spec: RenderSpec, context: RenderContext): Observable<Node|null> {
  switch (spec.type) {
    case RenderSpecType.ELEMENT:
      return renderElement(spec, context);
    case RenderSpecType.FRAGMENT:
      return renderFragment(spec, context);
    case RenderSpecType.HTML:
      return renderHtml(spec, context);
    case RenderSpecType.NODE:
      return renderNode(spec);
    case RenderSpecType.TEXT_NODE:
      return renderTextNode(spec, context);
    case RenderSpecType.TEMPLATE:
      return renderTemplate(spec, context);
  }
}
