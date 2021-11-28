const EVENT = 'pr-fake-resize';

class FakeResizeObserver implements ResizeObserver {
  constructor(private readonly callback: (entries: readonly ResizeObserverEntry[]) => void) { }
  unobserve(): void {
    // noop
  }

  disconnect(): void {
    // noop
  }

  observe(target: Element | SVGElement): void {
    target.addEventListener(EVENT, (event: Event) => {
      this.callback((event as CustomEvent).detail as readonly ResizeObserverEntry[]);
    });
  }
}

export function dispatchResizeEvent(
    target: Element,
    entries: ReadonlyArray<Partial<ResizeObserverEntry>>,
): Event {
  const event = new CustomEvent(EVENT, {detail: entries});
  target.dispatchEvent(event);
  return event;
}

export function installFakeResizeObserver(): () => void {
  const origResizeObserver = (globalThis as any).ResizeObserver;
  (globalThis as any).ResizeObserver = FakeResizeObserver;

  return () => {
    (globalThis as any).ResizeObserver = origResizeObserver;
  };
}

