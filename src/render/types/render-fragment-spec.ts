import {RenderSpec} from './render-spec';
import {RenderSpecType} from './render-spec-type';

interface Input {
  // This cannot be observable since the DocumentFragment disappears.
  readonly nodes: readonly RenderSpec[];
}

export interface RenderFragmentSpec extends Input {
  readonly type: RenderSpecType.FRAGMENT;
}

export function renderFragment(input: Input): RenderFragmentSpec {
  return {...input, type: RenderSpecType.FRAGMENT};
}
