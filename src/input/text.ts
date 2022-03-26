import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

import {Reference} from '../types/ctrl';
import {ApiType, IOType, IText} from '../types/io';
import {mutationObservable} from '../util/mutation-observable';


class ResolvedIText implements Reference<IText> {
  readonly apiType = ApiType.TEXT;
  readonly ioType = IOType.INPUT;

  resolve(target: HTMLElement): Observable<string> {
    return mutationObservable(target, {characterData: true, childList: true, subtree: true})
        .pipe(
            startWith({}),
            map(() => target.textContent ?? ''),
        );
  }
}

export function itext(): ResolvedIText {
  return new ResolvedIText();
}
