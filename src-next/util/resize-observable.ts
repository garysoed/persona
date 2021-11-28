import {Observable, fromEventPattern, of} from 'rxjs';
import {share, switchMap} from 'rxjs/operators';


export function resizeObservable(
    targetEl: Element,
    options: ResizeObserverOptions,
): Observable<ResizeObserverEntry> {
  return fromEventPattern<readonly ResizeObserverEntry[]>(
      handler => {
        const observer = new ResizeObserver(entries => handler(entries));
        observer.observe(targetEl, options);

        return observer;
      },
      (_, observer: ResizeObserver) => observer.disconnect(),
  )
      .pipe(
          switchMap(entries => of(...entries)),
          share(),
      );
}
