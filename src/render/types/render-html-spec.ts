import {OperatorFunction} from 'rxjs';

import {ParseType} from '../html-parse-service';
import {NodeWithId} from '../node-with-id';

import {BaseRenderSpec} from './base-render-spec';
import {ObservableOrValue} from './observable-or-value';
import {RenderSpecType} from './render-spec-type';


interface Input extends BaseRenderSpec {
  readonly raw: ObservableOrValue<string>;
  readonly parseType: ParseType;
  readonly decorator?: OperatorFunction<NodeWithId<Element>, NodeWithId<Element>>;
}

export interface RenderHtmlSpec extends Input {
  readonly type: RenderSpecType.HTML;
}

export function renderHtml(input: Input): RenderHtmlSpec {
  return {...input, type: RenderSpecType.HTML};
}
