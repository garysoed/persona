import {BaseRenderSpec} from './base-render-spec';
import {ObservableOrValue} from './observable-or-value';
import {RenderSpec} from './render-spec';
import {RenderSpecType} from './render-spec-type';


export interface RenderElementSpec extends BaseRenderSpec {
  readonly type: RenderSpecType.ELEMENT;
  readonly tag: string;
  readonly attrs?: ReadonlyMap<string, ObservableOrValue<string|undefined>>;
  readonly children?: ObservableOrValue<readonly RenderSpec[]>;
  readonly textContent?: ObservableOrValue<string>;
}