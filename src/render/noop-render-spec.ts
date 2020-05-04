import { NEVER, Observable } from 'rxjs';

import { RenderSpec } from './render-spec';

export class NoopRenderSpec implements RenderSpec {
  canReuseElement(): boolean {
    return true;
  }

  createElement(): Observable<HTMLElement> {
    return NEVER;
  }

  registerElement(element: HTMLElement): Observable<unknown> {
    return NEVER;
  }
}
