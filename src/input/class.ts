import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

import {ApiType, IClass, IOType} from '../types/io';
import {mutationObservable} from '../util/mutation-observable';


class ResolvedIClass implements IClass {
  readonly apiType = ApiType.CLASS;
  readonly ioType = IOType.INPUT;

  constructor(
    readonly className: string,
  ) {}

  resolve(target: Element): Observable<boolean> {
    return mutationObservable(
        target,
        {attributes: true, attributeFilter: ['class']},
    ).pipe(
        startWith({}),
        map(() => target.classList.contains(this.className)),
    );
  }
}

export function iclass(className: string): ResolvedIClass {
  return new ResolvedIClass(className);
}
