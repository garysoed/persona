import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';

import {NodeWithId} from '../types/node-with-id';

import {Decorator} from './apply-decorators';


export function applyStyles(
    key: string,
    value$: Observable<string|null>,
): Decorator<NodeWithId<HTMLElement>> {
  return el => value$.pipe(
      tap(value => {
        el.style.setProperty(key, value);
      }),
  );
}
