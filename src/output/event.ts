import {OperatorFunction, pipe} from 'rxjs';
import {tap} from 'rxjs/operators';

import {Resolved, UnresolvedIO} from '../types/ctrl';
import {ApiType, EventCtor, IOType, OEvent} from '../types/io';


class ResolvedOEvent<E extends Event> implements Resolved<UnresolvedOEvent<E>> {
  readonly apiType = ApiType.EVENT;
  readonly ioType = IOType.OUTPUT;

  constructor(
      readonly eventName: string,
      readonly eventType: EventCtor<E>,
      readonly target: HTMLElement,
  ) {}

  update(): OperatorFunction<E, E> {
    return pipe(
        tap(newValue => {
          this.target.dispatchEvent(newValue);
        }),
    );
  }
}

class UnresolvedOEvent<E extends Event> implements UnresolvedIO<OEvent<E>> {
  readonly apiType = ApiType.EVENT;
  readonly ioType = IOType.OUTPUT;

  constructor(
      readonly eventName: string,
      readonly eventType: EventCtor<E>,
  ) {}

  resolve(target: HTMLElement): ResolvedOEvent<E> {
    return new ResolvedOEvent(this.eventName, this.eventType, target);
  }
}

export function oevent<E extends Event>(eventName: string, eventType: EventCtor<E>): UnresolvedOEvent<E> {
  return new UnresolvedOEvent(eventName, eventType);
}
