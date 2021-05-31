import {diffMap} from 'gs-tools/export/rxjs';
import {Observable} from 'rxjs';
import {startWith, tap} from 'rxjs/operators';

import {NodeWithId} from '../node-with-id';

import {Decorator} from './apply-decorators';


export function applyStyles(
    styles$: Observable<ReadonlyMap<string, string|null>>,
): Decorator<NodeWithId<HTMLElement>> {
  return el => styles$.pipe(
      startWith(new Map()),
      diffMap(),
      tap(diff => {
        const style = el.style;
        switch (diff.type) {
          case 'delete':
            style.removeProperty(diff.key);
            break;
          case 'init':
            for (let i = 0; i < style.length; i++) {
              style.removeProperty(style.item(i));
            }

            for (const [key, value] of diff.value) {
              style.setProperty(key, value);
            }
            break;
          case 'set':
            style.setProperty(diff.key, diff.value);
            break;
        }
      }),
  );
}
