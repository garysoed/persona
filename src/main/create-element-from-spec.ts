import {arrayFrom} from 'gs-tools/export/collect';

export type AttributesSpec = Iterable<[string, string]>;

export function createElementFromSpec(
    tagName: string,
    attributes: AttributesSpec,
    innerText: string,
): HTMLElement {
  const newEl = document.createElement(tagName);
  applyAttributes(newEl, attributes);
  applyInnerText(newEl, innerText);

  return newEl;
}

export function applyAttributes(element: HTMLElement, attributes: AttributesSpec): void {
  const existingAttributes: Attr[] = [];
  for (const attr of arrayFrom(element.attributes)) {
    existingAttributes.push(attr);
  }

  for (const existingAttribute of existingAttributes) {
    element.removeAttribute(existingAttribute.name);
  }

  for (const [key, value] of attributes) {
    element.setAttribute(key, value);
  }
}

export function applyInnerText(element: HTMLElement, innerText: string): void {
  element.innerText = innerText;
}
