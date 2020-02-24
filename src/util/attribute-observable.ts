import { combineLatest, NEVER, Observable, of as observableOf } from 'rxjs';
import { distinctUntilChanged, map, shareReplay, startWith, switchMap } from 'rxjs/operators';

import { mutationObservable } from './mutation-observable';

/**
 * Creates observable that returns the parsed value of the attribute specified.
 */
export function attributeObservable<T>(
    attrName: string,
    parse: (unparsed: string) => T,
    elementObs: Observable<Element>,
): Observable<T> {
  return elementObs
      .pipe(
          switchMap(el => {
            return combineLatest(
                observableOf(el),
                mutationObservable(
                    el,
                    {
                      attributeFilter: [attrName],
                      attributeOldValue: true,
                      attributes: true,
                    },
                ),
            )
            .pipe(
                map(([el]) => {
                  return el.getAttribute(attrName) || '';
                }),
                startWith(el.getAttribute(attrName) || ''),
            );
          }),
          distinctUntilChanged(),
          switchMap(unparsedValue => {
            try {
              const value = parse(unparsedValue);
              return observableOf(value);
            } catch (e) {
              return NEVER;
            }
          }),
          shareReplay(1),
      );
}
