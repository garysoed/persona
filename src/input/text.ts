import {cache} from 'gs-tools/export/data';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

import {Resolved, UnresolvedIO} from '../types/ctrl';
import {ApiType, IOType, IText} from '../types/io';
import {mutationObservable} from '../util/mutation-observable';


class ResolvedIText implements Resolved<UnresolvedIText> {
  readonly apiType = ApiType.TEXT;
  readonly ioType = IOType.INPUT;

  constructor(
      readonly target: HTMLElement,
  ) {}

  @cache()
  get value$(): Observable<string> {
    return mutationObservable(this.target, {characterData: true, childList: true, subtree: true})
        .pipe(
            startWith({}),
            map(() => this.target.textContent ?? ''),
        );
  }
}

class UnresolvedIText implements UnresolvedIO<IText> {
  readonly apiType = ApiType.TEXT;
  readonly ioType = IOType.INPUT;

  resolve(target: HTMLElement): ResolvedIText {
    return new ResolvedIText(target);
  }
}

export function itext(): UnresolvedIText {
  return new UnresolvedIText();
}
