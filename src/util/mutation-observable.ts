import { fromEventPattern, Observable } from 'rxjs';
import { share } from 'rxjs/operators';

/**
 * Creates observable that listens to mutations on the given node.
 * @param targetNode Node to observe.
 * @param options MutationObserver options
 */
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
      (_, mutationObserver: MutationObserver) => mutationObserver.disconnect(),
  )
  .pipe(share());
}
