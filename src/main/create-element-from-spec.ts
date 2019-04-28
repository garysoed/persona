export type AttributesSpec = Iterable<[string, string]>;

export function createElementFromSpec(
    tagName: string,
    attributes: AttributesSpec,
): HTMLElement {
  const newEl = document.createElement(tagName);
  applyAttributes(newEl, attributes);

  return newEl;
}

export function applyAttributes(element: HTMLElement, attributes: AttributesSpec): void {
  for (const [key, value] of attributes) {
    element.setAttribute(key, value);
  }
}
