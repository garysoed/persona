import {BaseRenderSpec} from './base-render-spec';
import {ObservableOrValue} from './observable-or-value';
import {RenderSpecType} from './render-spec-type';


interface Input extends BaseRenderSpec<Text> {
  readonly text: ObservableOrValue<string>;
}

export interface RenderTextNodeSpec extends Input {
  readonly type: RenderSpecType.TEXT_NODE;
}

export function renderTextNode(input: Input): RenderTextNodeSpec {
  return {...input, type: RenderSpecType.TEXT_NODE};
}
