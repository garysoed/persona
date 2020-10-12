import { fromEventPattern, Observable } from 'rxjs';
import { share } from 'rxjs/operators';

export interface ResizeObserverInit {
  readonly box?: 'content-box'|'border-box';
}

export declare interface ResizeObserver {
  disconnect(): void;
  observe(target: Element|SVGElement, options: ResizeObserverInit): void;
}

declare var ResizeObserver: {
  prototype: ResizeObserver;
  new (callback: () => any): ResizeObserver;
};

export function resizeObservable(
    targetEl: Element,
    options: ResizeObserverInit,
): Observable<{}> {
  return fromEventPattern<{}>(
      handler => {
        const observer = new ResizeObserver(() => handler({}));
        observer.observe(targetEl, options);

        return observer;
      },
      (_, observer: ResizeObserver) => observer.disconnect(),
  )
  .pipe(share());
}
