import { fromEventPattern, Observable } from 'rxjs';
import { share } from 'rxjs/operators';

export interface ResizeObserverInit {
  readonly box?: 'content-box'|'border-box';
}

export declare interface ResizeObserver {
  disconnect(): void;
  observe(target: Element|SVGElement, options: ResizeObserverInit): void;
}

export declare interface ResizeObserverEntry {
  readonly contentRect: DOMRect;
}

declare var ResizeObserver: {
  prototype: ResizeObserver;
  new (callback: (entries: readonly ResizeObserverEntry[]) => any): ResizeObserver;
};

export function resizeObservable(
    targetEl: Element,
    options: ResizeObserverInit,
): Observable<readonly ResizeObserverEntry[]> {
  return fromEventPattern<readonly ResizeObserverEntry[]>(
      handler => {
        const observer = new ResizeObserver(entries => handler(entries));
        observer.observe(targetEl, options);

        return observer;
      },
      (_, observer: ResizeObserver) => observer.disconnect(),
  )
  .pipe(share());
}
