import { NEVER, Observable } from 'rxjs';

import { RenderSpec } from './render-spec';

export class NoopRenderSpec implements RenderSpec {
  canReuseElement(): boolean {
    return true;
  }

  createElement(): HTMLElement {
    throw new Error('Noop');
  }

  registerElement(element: HTMLElement): Observable<unknown> {
    return NEVER;
  }
}
