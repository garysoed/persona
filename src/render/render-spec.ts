export interface RenderSpec {
  canReuseElement(element: HTMLElement): boolean;

  createElement(): HTMLElement;

  updateElement(element: HTMLElement): void;
}
