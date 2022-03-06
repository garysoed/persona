import {cache} from 'gs-tools/export/data';
import {filterByType} from 'gs-tools/export/rxjs';
import {instanceofType} from 'gs-types';
import {fromEvent, Observable} from 'rxjs';
import {filter} from 'rxjs/operators';

import {Resolved, UnresolvedIO} from '../types/ctrl';
import {ApiType, EventCtor, IEvent, IOType} from '../types/io';

export interface Options {
  readonly matchTarget: boolean;
}

const DEFAULT_OPTIONS: Options = {
  matchTarget: false,
};

class ResolvedIEvent<E extends Event> implements Resolved<UnresolvedIEvent<E>> {
  readonly apiType = ApiType.EVENT;
  readonly ioType = IOType.INPUT;

  constructor(
    readonly eventName: string,
    readonly eventType: EventCtor<E>,
    private readonly options: Options,
    readonly target: HTMLElement,
  ) {}

  @cache()
  get value$(): Observable<E> {
    return fromEvent(this.target, this.eventName).pipe(
        filter(event => {
          if (this.options.matchTarget && event.target !== this.target) {
            return false;
          }

          return true;
        }),
        filterByType(instanceofType(this.eventType)),
    );
  }
}

export class UnresolvedIEvent<E extends Event> implements UnresolvedIO<HTMLElement, IEvent<E>> {
  readonly apiType = ApiType.EVENT;
  readonly ioType = IOType.INPUT;

  constructor(
      readonly eventName: string,
      readonly eventType: EventCtor<E>,
      private readonly options: Options,
  ) {}

  resolve(target: HTMLElement): ResolvedIEvent<E> {
    return new ResolvedIEvent(this.eventName, this.eventType, this.options, target);
  }
}

export function ievent<E extends Event>(
    eventName: string,
    eventType: EventCtor<E>,
    options: Partial<Options> = {},
): UnresolvedIEvent<E> {
  return new UnresolvedIEvent(eventName, eventType, {...DEFAULT_OPTIONS, ...options});
}
