import { fromEventPattern, Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

export function mutationObservable(
    targetNode: Node,
    options: MutationObserverInit,
): Observable<MutationRecord[]> {
  return fromEventPattern<MutationRecord[]>(
      handler => {
        const mutationObserver = new MutationObserver(records => handler(records));
        mutationObserver.observe(targetNode, options);

        return mutationObserver;
      },
      (_, mutationObserver: MutationObserver) => {
        mutationObserver.disconnect();
      },
  )
  .pipe(shareReplay(1));
}
