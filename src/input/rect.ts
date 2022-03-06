import {cache} from 'gs-tools/export/data';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

import {Resolved, UnresolvedIO} from '../types/ctrl';
import {ApiType, IOType, IRect} from '../types/io';
import {resizeObservable} from '../util/resize-observable';


class ResolvedIRect implements Resolved<UnresolvedIRect> {
  readonly apiType = ApiType.RECT;
  readonly ioType = IOType.INPUT;

  constructor(
    readonly target: HTMLElement,
  ) {}

  @cache()
  get value$(): Observable<DOMRect> {
    return resizeObservable(this.target, {}).pipe(
        startWith({}),
        map(() => this.target.getBoundingClientRect()),
    );
  }
}

export class UnresolvedIRect implements UnresolvedIO<HTMLElement, IRect> {
  readonly apiType = ApiType.RECT;
  readonly ioType = IOType.INPUT;

  resolve(target: HTMLElement): ResolvedIRect {
    return new ResolvedIRect(target);
  }
}

export function irect(): UnresolvedIRect {
  return new UnresolvedIRect();
}
