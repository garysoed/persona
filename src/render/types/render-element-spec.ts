import {Observable} from 'rxjs';

import {BaseRenderSpec} from './base-render-spec';
import {normalize, normalizeMap, ObservableOrValue} from './observable-or-value';
import {RenderSpec} from './render-spec';
import {RenderSpecType} from './render-spec-type';

interface Input extends BaseRenderSpec<HTMLElement> {
  readonly tag: string;
  readonly attrs?: ReadonlyMap<string, ObservableOrValue<string|undefined>>;
  readonly children?: ObservableOrValue<readonly RenderSpec[]>;
  readonly textContent?: ObservableOrValue<string>;
}

export interface RenderElementSpec extends Input {
  readonly type: RenderSpecType.ELEMENT;
  readonly attrs?: ReadonlyMap<string, Observable<string|undefined>>;
  readonly children?: Observable<readonly RenderSpec[]>;
  readonly textContent?: Observable<string>;
}

export function renderElement(input: Input): RenderElementSpec {
  return {
    ...input,
    type: RenderSpecType.ELEMENT,
    attrs: input.attrs ? normalizeMap(input.attrs) : undefined,
    children: input.children ? normalize(input.children) : undefined,
    textContent: input.textContent !== undefined ? normalize(input.textContent) : undefined,
  };
}