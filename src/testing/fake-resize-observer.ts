import { ResizeObserver, ResizeObserverInit } from '../util/resize-observable';

const EVENT = 'pr-fake-resize';

class FakeResizeObserver implements ResizeObserver {
  constructor(private readonly callback: () => void) { }

  disconnect(): void {
    // noop
  }

  observe(target: Element | SVGElement, options: ResizeObserverInit): void {
    target.addEventListener(EVENT, () => {
      this.callback();
    });
  }
}

export function dispatchResizeEvent(target: Element): void {
  target.dispatchEvent(new CustomEvent(EVENT));
}

export function installFakeResizeObserver(): () => void {
  const origResizeObserver = (globalThis as any).ResizeObserver;
  (globalThis as any).ResizeObserver = FakeResizeObserver;

  return () => {
    (globalThis as any).ResizeObserver = origResizeObserver;
  };
}

