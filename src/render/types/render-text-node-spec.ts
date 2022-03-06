import {Observable} from 'rxjs';

import {RenderSpecType} from './render-spec-type';


interface Input {
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
