type Harness<E extends Element> = E & {};


export function getEl<E extends Element>(hostEl: HTMLElement, selector: string): Harness<E>|null {
  const element: E = (hostEl.shadowRoot?.querySelector(selector) ?? null) as E;
  if (!element) {
    return null;
  }

  return Object.assign(element, {});
}
