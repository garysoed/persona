import {Observable} from 'rxjs';

import {BaseRenderSpec} from './base-render-spec';
import {RenderSpecType} from './render-spec-type';


interface Input extends BaseRenderSpec<Element> {
  readonly raw: Observable<string>;
  readonly parseType: DOMParserSupportedType;
}

export interface RenderHtmlSpec extends Input {
  readonly type: RenderSpecType.HTML;
  readonly raw: Observable<string>
}

export function renderHtml(input: Input): RenderHtmlSpec {
  return {
    ...input,
    type: RenderSpecType.HTML,
  };
}
