import { ResizeObserver, ResizeObserverEntry } from '../util/resize-observable';

const EVENT = 'pr-fake-resize';

class FakeResizeObserver implements ResizeObserver {
  constructor(private readonly callback: (entries: readonly ResizeObserverEntry[]) => void) { }

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
    entries: readonly ResizeObserverEntry[],
): void {
  target.dispatchEvent(new CustomEvent(EVENT, {detail: entries}));
}

export function installFakeResizeObserver(): () => void {
  const origResizeObserver = (globalThis as any).ResizeObserver;
  (globalThis as any).ResizeObserver = FakeResizeObserver;

  return () => {
    (globalThis as any).ResizeObserver = origResizeObserver;
  };
}

