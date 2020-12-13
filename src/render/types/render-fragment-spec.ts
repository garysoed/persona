import {BaseRenderSpec} from './base-render-spec';
import {RenderSpecType} from './render-spec-type';

type Input = BaseRenderSpec;

export interface RenderFragmentSpec extends Input {
  readonly type: RenderSpecType.FRAGMENT;
}

export function renderFragment(input: Input): RenderFragmentSpec {
  return {...input, type: RenderSpecType.FRAGMENT};
}
