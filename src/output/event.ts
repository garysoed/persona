import {OperatorFunction, pipe} from 'rxjs';
import {tap} from 'rxjs/operators';

import {Resolved, UnresolvedIO} from '../types/ctrl';
import {ApiType, IOType, OEvent} from '../types/io';


class ResolvedOEvent implements Resolved<UnresolvedOEvent> {
  readonly apiType = ApiType.EVENT;
  readonly ioType = IOType.OUTPUT;

  constructor(
      readonly eventName: string,
      readonly target: HTMLElement,
  ) {}

  update(): OperatorFunction<Event, Event> {
    return pipe(
        tap(newValue => {
          this.target.dispatchEvent(newValue);
        }),
    );
  }
}

class UnresolvedOEvent implements UnresolvedIO<OEvent> {
  readonly apiType = ApiType.EVENT;
  readonly ioType = IOType.OUTPUT;

  constructor(
      readonly eventName: string,
  ) {}

  resolve(target: HTMLElement): ResolvedOEvent {
    return new ResolvedOEvent(this.eventName, target);
  }
}

export function oevent(eventName: string): UnresolvedOEvent {
  return new UnresolvedOEvent(eventName);
}
