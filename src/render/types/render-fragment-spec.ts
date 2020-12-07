import {BaseRenderSpec} from './base-render-spec';
import {RenderSpecType} from './render-spec-type';

export interface RenderFragmentSpec extends BaseRenderSpec {
  readonly type: RenderSpecType.FRAGMENT;
}
