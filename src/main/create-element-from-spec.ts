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
  for (const [key, value] of attributes) {
    element.setAttribute(key, value);
  }
}

export function applyInnerText(element: HTMLElement, innerText: string): void {
  element.innerText = innerText;
}
