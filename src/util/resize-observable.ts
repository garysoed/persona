import {Observable, fromEventPattern} from 'rxjs';
import {share} from 'rxjs/operators';


export function resizeObservable(
    targetEl: Element,
    options: ResizeObserverOptions,
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
