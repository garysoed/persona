import { NEVER, Observable } from 'rxjs';

import { RenderSpec } from './render-spec';

export class NoopRenderSpec implements RenderSpec {
  canReuseNode(): boolean {
    return true;
  }

  createNode(): Observable<Element> {
    return NEVER;
  }

  registerNode(element: Element): Observable<unknown> {
    return NEVER;
  }
}
