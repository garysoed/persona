import {Observable} from 'rxjs';

import {ParseType} from '../html-parse-service';

import {BaseRenderSpec} from './base-render-spec';
import {normalize, ObservableOrValue} from './observable-or-value';
import {RenderSpecType} from './render-spec-type';


interface Input extends BaseRenderSpec<Element> {
  readonly raw: ObservableOrValue<string>;
  readonly parseType: ParseType;
}

export interface RenderHtmlSpec extends Input {
  readonly type: RenderSpecType.HTML;
  readonly raw: Observable<string>
}

export function renderHtml(input: Input): RenderHtmlSpec {
  return {
    ...input,
    raw: normalize(input.raw),
    type: RenderSpecType.HTML,
  };
}
