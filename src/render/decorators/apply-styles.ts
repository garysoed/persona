import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';

import {Decorator} from './apply-decorators';


export function applyStyles(key: string, value$: Observable<string|null>): Decorator<HTMLElement> {
  return el => value$.pipe(
      tap(value => {
        el.style.setProperty(key, value);
      }),
  );
}
