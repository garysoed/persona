import {fromEvent, merge, Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

import {ApiType, IOType, IText} from '../types/io';
import {MUTATION_EVENT_NAME} from '../util/mutate-event';
import {mutationObservable} from '../util/mutation-observable';

class ResolvedIText implements IText {
  readonly apiType = ApiType.TEXT;
  readonly ioType = IOType.INPUT;

  resolve(target: Element): Observable<string> {
    return merge(
      mutationObservable(target, {
        characterData: true,
        childList: true,
        subtree: true,
      }),
      fromEvent(target, MUTATION_EVENT_NAME),
    ).pipe(
      startWith({}),
      map(() => target.textContent ?? ''),
    );
  }
}

export function itext(): ResolvedIText {
  return new ResolvedIText();
}
