import {cache} from 'gs-tools/export/data';
import {Observable, of} from 'rxjs';

import {Resolved, UnresolvedIO} from '../types/ctrl';
import {ApiType, IOType, ITarget} from '../types/io';


class ResolvedITarget implements Resolved<UnresolvedITarget> {
  readonly apiType = ApiType.TARGET;
  readonly ioType = IOType.INPUT;

  constructor(
    readonly target: HTMLElement,
  ) {}

  @cache()
  get value$(): Observable<HTMLElement> {
    return of(this.target);
  }
}

export class UnresolvedITarget implements UnresolvedIO<ITarget> {
  readonly apiType = ApiType.TARGET;
  readonly ioType = IOType.INPUT;

  resolve(target: HTMLElement): ResolvedITarget {
    return new ResolvedITarget(target);
  }
}

export function itarget(): UnresolvedITarget {
  return new UnresolvedITarget();
}
