import {BaseRenderSpec} from './base-render-spec';
import {RenderSpecType} from './render-spec-type';


interface Input extends BaseRenderSpec<HTMLElement> {
  readonly tag: string;
}

export interface RenderElementSpec extends Input {
  readonly type: RenderSpecType.ELEMENT;
}

export function renderElement(input: Input): RenderElementSpec {
  return {
    ...input,
    type: RenderSpecType.ELEMENT,
  };
}