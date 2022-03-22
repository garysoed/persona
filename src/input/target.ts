import {Observable, of} from 'rxjs';

import {Resolved} from '../types/ctrl';
import {ApiType, IOType, ITarget} from '../types/io';


class ResolvedITarget implements Resolved<ITarget> {
  readonly apiType = ApiType.TARGET;
  readonly ioType = IOType.INPUT;

  resolve(target: HTMLElement): Observable<HTMLElement> {
    return of(target);
  }
}

export function itarget(): ResolvedITarget {
  return new ResolvedITarget();
}
