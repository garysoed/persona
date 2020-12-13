import {BaseRenderSpec} from './base-render-spec';
import {RenderSpecType} from './render-spec-type';

interface Input extends BaseRenderSpec {
  readonly node: Node;
}

export interface RenderNodeSpec extends Input {
  readonly type: RenderSpecType.NODE;
}

export function renderNode(input: Input): RenderNodeSpec {
  return {...input, type: RenderSpecType.NODE};
}
