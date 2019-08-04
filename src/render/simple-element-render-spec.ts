import { RenderSpec } from './render-spec';

export class SimpleElementRenderSpec implements RenderSpec {
  constructor(
      private readonly tagName: string,
      private readonly attrs: Map<string, string> = new Map(),
      private readonly innerText: string = '',
  ) { }

  canReuseElement(element: HTMLElement): boolean {
    return element.tagName.toLowerCase() === this.tagName;
  }

  createElement(): HTMLElement {
    return document.createElement(this.tagName);
  }

  updateElement(element: HTMLElement): void {
    const existingAttributes: Attr[] = [];
    for (let i = 0; i < element.attributes.length; i++) {
      existingAttributes.push(element.attributes.item(i)!);
    }

    for (const existingAttribute of existingAttributes) {
      element.removeAttribute(existingAttribute.name);
    }

    for (const [key, value] of this.attrs) {
      element.setAttribute(key, value);
    }

    element.innerText = this.innerText;
  }
}
