import {OperatorFunction, pipe} from 'rxjs';
import {tap} from 'rxjs/operators';

import {Resolved} from '../types/ctrl';
import {ApiType, EventCtor, IOType, OEvent} from '../types/io';


class ResolvedOEvent<E extends Event> implements Resolved<OEvent<E>> {
  readonly apiType = ApiType.EVENT;
  readonly ioType = IOType.OUTPUT;

  constructor(
      readonly eventName: string,
      readonly eventType: EventCtor<E>,
  ) {}

  resolve(target: HTMLElement): () => OperatorFunction<E, E> {
    return () => pipe(
        tap(newValue => {
          target.dispatchEvent(newValue);
        }),
    );
  }
}

export function oevent<E extends Event>(eventName: string, eventType: EventCtor<E>): ResolvedOEvent<E> {
  return new ResolvedOEvent(eventName, eventType);
}
