interface Options {
  readonly altKey?: boolean;
  readonly ctrlKey?: boolean;
  readonly metaKey?: boolean;
  readonly shiftKey?: boolean;
}

type Harness = HTMLElement & {
  simulateKeydown(key: string, options?: Options): KeyboardEvent
};

export function getEl(el: HTMLElement, id: string): Harness|null {
  const element = el.shadowRoot?.getElementById(id) ?? null;
  if (!element) {
    return null;
  }

  return Object.assign(element, {
    simulateKeydown(key: string, options: Options = {}): KeyboardEvent {
      const event = new KeyboardEvent('keydown', {key, ...options});
      element.dispatchEvent(event);
      return event;
    },
  });
}
