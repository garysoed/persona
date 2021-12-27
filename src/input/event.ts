import {cache} from 'gs-tools/export/data';
import {fromEvent, Observable} from 'rxjs';

import {Resolved, UnresolvedIO} from '../types/ctrl';
import {ApiType, IEvent, IOType} from '../types/io';


class ResolvedIEvent implements Resolved<UnresolvedIEvent> {
  readonly apiType = ApiType.EVENT;
  readonly ioType = IOType.INPUT;

  constructor(
    readonly eventName: string,
    readonly target: HTMLElement,
  ) {}

  @cache()
  get value$(): Observable<Event> {
    return fromEvent(this.target, this.eventName);
  }
}

export class UnresolvedIEvent implements UnresolvedIO<IEvent> {
  readonly apiType = ApiType.EVENT;
  readonly ioType = IOType.INPUT;

  constructor(
      readonly eventName: string,
  ) {}

  resolve(target: HTMLElement): ResolvedIEvent {
    return new ResolvedIEvent(this.eventName, target);
  }
}

export function ievent(eventName: string): UnresolvedIEvent {
  return new UnresolvedIEvent(eventName);
}
