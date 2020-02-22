import { Observable, throwError } from 'rxjs';
import { filter, map, shareReplay, startWith } from 'rxjs/operators';

import { mutationObservable } from './mutation-observable';

/**
 * Creates observable that returns the element selected by the given selector.
 * @param selector Function to select the element.
 */
export function elementObservable<T extends Element, N extends Node>(
    root: N,
    selector: (root: N) => T): Observable<T> {
  try {
    const startEl = selector(root);

    return mutationObservable(root, {childList: true, subtree: true})
        .pipe(
            filter(records => records.length > 0),
            map(() => selector(root)),
            startWith(startEl),
            shareReplay(1),
        );
  } catch (e) {
    return throwError(e);
  }
}
