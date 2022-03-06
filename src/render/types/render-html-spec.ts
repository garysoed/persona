import {Observable, OperatorFunction} from 'rxjs';
import {tap} from 'rxjs/operators';

import {RenderSpecType} from './render-spec-type';


interface Input {
  readonly raw: Observable<string>;
  readonly parseType: DOMParserSupportedType;
  readonly decorator?: OperatorFunction<Element, unknown>;
}

export interface RenderHtmlSpec extends Input {
  readonly type: RenderSpecType.HTML;
  readonly raw: Observable<string>
  readonly decorator: OperatorFunction<Element, unknown>;
}

export function renderHtml(input: Input): RenderHtmlSpec {
  return {
    type: RenderSpecType.HTML,
    decorator: tap(),
    ...input,
  };
}
