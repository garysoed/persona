import { Observable, throwError } from 'rxjs';
import { filter, map, shareReplay, startWith } from 'rxjs/operators';
import { mutationObservable } from './mutation-observable';

export function elementObservable<T extends Element>(
    root: ShadowRoot,
    getElement: (root: ShadowRoot) => T): Observable<T> {
  try {
    const startEl = getElement(root);

    return mutationObservable(root, {childList: true, subtree: true})
        .pipe(
            filter(records => records.length > 0),
            map(() => getElement(root)),
            startWith(startEl),
            shareReplay(1),
        );
  } catch (e) {
    return throwError(e);
  }
}
