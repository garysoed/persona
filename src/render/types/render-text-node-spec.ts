import {BaseRenderSpec} from './base-render-spec';
import {ObservableOrValue} from './observable-or-value';
import {RenderSpecType} from './render-spec-type';


export interface RenderTextNodeSpec extends BaseRenderSpec {
  readonly type: RenderSpecType.TEXT_NODE;
  readonly text: ObservableOrValue<string>;
}