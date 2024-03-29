import {RenderSpecType} from './render-spec-type';

interface Input<N extends Node> {
  readonly node: N;
}

export interface RenderNodeSpec<N extends Node> extends Input<N> {
  readonly type: RenderSpecType.NODE;
}

export function renderNode<N extends Node>(input: Input<N>): RenderNodeSpec<N> {
  return {...input, type: RenderSpecType.NODE};
}
