import {Observable, fromEvent} from 'rxjs';
import {map, shareReplay, startWith} from 'rxjs/operators';


export function mediaQueryObservable(query: string): Observable<boolean> {
  const mediaQuery = window.matchMedia(query);

  return fromEvent(mediaQuery, 'change')
      .pipe(
          map(() => mediaQuery.matches),
          startWith(mediaQuery.matches),
          shareReplay(1),
      );
}