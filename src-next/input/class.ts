import {cache} from 'gs-tools/export/data';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

import {Resolved, UnresolvedIO} from '../types/ctrl';
import {ApiType, IClass, IOType} from '../types/io';
import {mutationObservable} from '../util/mutation-observable';


class ResolvedIClass implements Resolved<UnresolvedIClass> {
  readonly apiType = ApiType.CLASS;
  readonly ioType = IOType.INPUT;

  constructor(
    readonly className: string,
    readonly target: HTMLElement,
  ) {}

  @cache()
  get value$(): Observable<boolean> {
    return mutationObservable(
        this.target,
        {attributes: true, attributeFilter: ['class']},
    ).pipe(
        startWith({}),
        map(() => this.target.classList.contains(this.className)),
    );
  }
}

export class UnresolvedIClass implements UnresolvedIO<IClass> {
  readonly apiType = ApiType.CLASS;
  readonly ioType = IOType.INPUT;

  constructor(
      readonly className: string,
  ) {}

  resolve(target: HTMLElement): ResolvedIClass {
    return new ResolvedIClass(this.className, target);
  }
}

export function iclass(className: string): UnresolvedIClass {
  return new UnresolvedIClass(className);
}
