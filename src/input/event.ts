import {filterByType} from 'gs-tools/export/rxjs';
import {instanceofType} from 'gs-types';
import {fromEvent, Observable} from 'rxjs';
import {filter} from 'rxjs/operators';

import {Resolved} from '../types/ctrl';
import {ApiType, EventCtor, IEvent, IOType} from '../types/io';


export interface Options {
  readonly matchTarget: boolean;
}

const DEFAULT_OPTIONS: Options = {
  matchTarget: false,
};

class ResolvedIEvent<E extends Event> implements Resolved<IEvent<E>> {
  readonly apiType = ApiType.EVENT;
  readonly ioType = IOType.INPUT;

  constructor(
    readonly eventName: string,
    readonly eventType: EventCtor<E>,
    private readonly options: Options,
  ) {}

  resolve(target: HTMLElement): Observable<E> {
    return fromEvent(target, this.eventName).pipe(
        filter(event => {
          if (this.options.matchTarget && event.target !== target) {
            return false;
          }

          return true;
        }),
        filterByType(instanceofType(this.eventType)),
    );
  }
}

export function ievent<E extends Event>(
    eventName: string,
    eventType: EventCtor<E>,
    options: Partial<Options> = {},
): ResolvedIEvent<E> {
  return new ResolvedIEvent(eventName, eventType, {...DEFAULT_OPTIONS, ...options});
}
