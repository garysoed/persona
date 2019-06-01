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
  for (let i = 0; i < element.attributes.length; i++) {
    existingAttributes.push(element.attributes.item(i)!);
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
