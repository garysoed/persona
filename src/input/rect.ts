import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

import {Resolved} from '../types/ctrl';
import {ApiType, IOType, IRect} from '../types/io';
import {resizeObservable} from '../util/resize-observable';


class ResolvedIRect implements Resolved<IRect> {
  readonly apiType = ApiType.RECT;
  readonly ioType = IOType.INPUT;

  resolve(target: HTMLElement): Observable<DOMRect> {
    return resizeObservable(target, {}).pipe(
        startWith({}),
        map(() => target.getBoundingClientRect()),
    );
  }
}

export function irect(): ResolvedIRect {
  return new ResolvedIRect();
}
