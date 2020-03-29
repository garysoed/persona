import { RenderSpec } from './render-spec';

export class NoopRenderSpec implements RenderSpec {
  canReuseElement(): boolean {
    return true;
  }

  createElement(): HTMLElement {
    throw new Error('Noop');
  }

  updateElement(element: HTMLElement): void {
    // noop.
  }
}
