import {Observable, of} from 'rxjs';

import {ApiType, IOType, ITarget} from '../types/io';


class ResolvedITarget implements ITarget {
  readonly apiType = ApiType.TARGET;
  readonly ioType = IOType.INPUT;

  resolve(target: Element): Observable<Element> {
    return of(target);
  }
}

export function itarget(): ResolvedITarget {
  return new ResolvedITarget();
}
