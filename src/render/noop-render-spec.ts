import { NEVER, Observable } from 'rxjs';

import { RenderSpec } from './render-spec';

export class NoopRenderSpec implements RenderSpec {
  canReuseElement(): boolean {
    return true;
  }

  createElement(): Observable<Element> {
    return NEVER;
  }

  registerElement(element: Element): Observable<unknown> {
    return NEVER;
  }
}
