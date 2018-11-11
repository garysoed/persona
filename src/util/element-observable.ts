import { Observable } from 'rxjs';
import { filter, map, shareReplay, startWith } from 'rxjs/operators';
import { mutationObservable } from './mutation-observable';

export function elementObservable<T extends HTMLElement>(
    root: ShadowRoot,
    getElement: (root: ShadowRoot) => T): Observable<T> {
  return mutationObservable(root, {childList: true, subtree: true})
      .pipe(
          filter(records => records.length > 0),
          map(() => getElement(root)),
          startWith(getElement(root)),
          shareReplay(1),
      );
}
