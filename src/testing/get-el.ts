type Harness = HTMLElement & {
};


export function getEl(hostEl: HTMLElement, id: string): Harness|null {
  const element = hostEl.shadowRoot?.getElementById(id) ?? null;
  if (!element) {
    return null;
  }

  return Object.assign(element, {});
}
