import {Observable} from 'rxjs';

import {BaseRenderSpec} from './base-render-spec';
import {normalize, ObservableOrValue} from './observable-or-value';
import {RenderSpecType} from './render-spec-type';


interface Input extends BaseRenderSpec<Text> {
  readonly textContent: ObservableOrValue<string>;
}

export interface RenderTextNodeSpec extends Input {
  readonly type: RenderSpecType.TEXT_NODE;
  readonly textContent: Observable<string>;
}

export function renderTextNode(input: Input): RenderTextNodeSpec {
  return {
    ...input,
    type: RenderSpecType.TEXT_NODE,
    textContent: normalize(input.textContent),
  };
}
