import {BaseRenderSpec} from './base-render-spec';
import {ObservableOrValue} from './observable-or-value';
import {RenderSpec} from './render-spec';
import {RenderSpecType} from './render-spec-type';

interface Input extends BaseRenderSpec {
  readonly tag: string;
  readonly attrs?: ReadonlyMap<string, ObservableOrValue<string|undefined>>;
  readonly children?: ObservableOrValue<readonly RenderSpec[]>;
  readonly textContent?: ObservableOrValue<string>;
}

export interface RenderElementSpec extends Input {
  readonly type: RenderSpecType.ELEMENT;
}

export function renderElement(input: Input): RenderElementSpec {
  return {...input, type: RenderSpecType.ELEMENT};
}