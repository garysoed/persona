import {Observable} from 'rxjs';

import {BaseRenderSpec} from './base-render-spec';
import {RenderSpecType} from './render-spec-type';


interface Input extends BaseRenderSpec<Text> {
  readonly textContent: Observable<string>;
}

export interface RenderTextNodeSpec extends Input {
  readonly type: RenderSpecType.TEXT_NODE;
  readonly textContent: Observable<string>;
}

export function renderTextNode(input: Input): RenderTextNodeSpec {
  return {
    type: RenderSpecType.TEXT_NODE,
    ...input,
  };
}
