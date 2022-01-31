import {Observable} from 'rxjs';

import {BaseRenderSpec} from './base-render-spec';
import {RenderSpec} from './render-spec';
import {RenderSpecType} from './render-spec-type';

interface Input extends BaseRenderSpec<HTMLElement> {
  readonly tag: string;
  readonly attrs?: ReadonlyMap<string, Observable<string|undefined>>;
  readonly children?: Observable<readonly RenderSpec[]>;
  readonly styles?: ReadonlyMap<string, Observable<string|null>>;
  readonly textContent?: Observable<string|undefined>;
}

export interface RenderElementSpec extends Input {
  readonly type: RenderSpecType.ELEMENT;
  readonly attrs?: ReadonlyMap<string, Observable<string|undefined>>;
  readonly children?: Observable<readonly RenderSpec[]>;
  readonly styles?: ReadonlyMap<string, Observable<string|null>>;
  readonly textContent?: Observable<string|undefined>;
}

export function renderElement(input: Input): RenderElementSpec {
  return {
    ...input,
    type: RenderSpecType.ELEMENT,
  };
}