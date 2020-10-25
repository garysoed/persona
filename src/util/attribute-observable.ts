import { combineLatest, NEVER, Observable, of as observableOf } from 'rxjs';
import { distinctUntilChanged, map, shareReplay, startWith, switchMap } from 'rxjs/operators';

import { mutationObservable } from './mutation-observable';

/**
 * Creates observable that returns the parsed value of the attribute specified.
 */
export function attributeObservable(
    element: Element,
    attrName: string,
): Observable<string> {
  return mutationObservable(
      element,
      {
        attributeFilter: [attrName],
        attributeOldValue: true,
        attributes: true,
      },
  )
  .pipe(
      map(() => {
        return element.getAttribute(attrName) || '';
      }),
      startWith(element.getAttribute(attrName) || ''),
      distinctUntilChanged(),
      shareReplay({bufferSize: 1, refCount: true}),
  );
}
