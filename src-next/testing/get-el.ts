export function getEl(el: HTMLElement, id: string): HTMLElement|null {
  return el.shadowRoot?.getElementById(id) ?? null;
}
