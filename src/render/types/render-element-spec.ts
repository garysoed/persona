import {Observable} from 'rxjs';

import {BaseRenderSpec} from './base-render-spec';
import {normalize, normalizeMap, ObservableOrValue} from './observable-or-value';
import {RenderSpec} from './render-spec';
import {RenderSpecType} from './render-spec-type';

interface Input extends BaseRenderSpec<HTMLElement> {
  readonly tag: string;
  readonly attrs?: ReadonlyMap<string, ObservableOrValue<string|undefined>>;
  readonly children?: ObservableOrValue<readonly RenderSpec[]>;
  readonly styles?: ObservableOrValue<ReadonlyMap<string, string|null>>;
  readonly textContent?: ObservableOrValue<string|undefined>;
}

export interface RenderElementSpec extends Input {
  readonly type: RenderSpecType.ELEMENT;
  readonly attrs?: ReadonlyMap<string, Observable<string|undefined>>;
  readonly children?: Observable<readonly RenderSpec[]>;
  readonly styles?: Observable<ReadonlyMap<string, string|null>>;
  readonly textContent?: Observable<string|undefined>;
}

export function renderElement(input: Input): RenderElementSpec {
  return {
    ...input,
    type: RenderSpecType.ELEMENT,
    attrs: input.attrs ? normalizeMap(input.attrs) : undefined,
    children: input.children ? normalize(input.children) : undefined,
    styles: input.styles ? normalize(input.styles) : undefined,
    textContent: input.textContent !== undefined ? normalize(input.textContent) : undefined,
  };
}