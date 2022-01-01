import {cache} from 'gs-tools/export/data';
import {fromEvent, Observable} from 'rxjs';
import {filter} from 'rxjs/operators';

import {Resolved, UnresolvedIO} from '../types/ctrl';
import {ApiType, IEvent, IOType} from '../types/io';

export interface Options {
  readonly matchTarget: boolean;
}

const DEFAULT_OPTIONS: Options = {
  matchTarget: false,
};


class ResolvedIEvent implements Resolved<UnresolvedIEvent> {
  readonly apiType = ApiType.EVENT;
  readonly ioType = IOType.INPUT;

  constructor(
    readonly eventName: string,
    private readonly options: Options,
    readonly target: HTMLElement,
  ) {}

  @cache()
  get value$(): Observable<Event> {
    return fromEvent(this.target, this.eventName).pipe(
        filter(event => {
          if (this.options.matchTarget && event.target !== this.target) {
            return false;
          }

          return true;
        }),
    );
  }
}

export class UnresolvedIEvent implements UnresolvedIO<IEvent> {
  readonly apiType = ApiType.EVENT;
  readonly ioType = IOType.INPUT;

  constructor(
      readonly eventName: string,
      private readonly options: Options,
  ) {}

  resolve(target: HTMLElement): ResolvedIEvent {
    return new ResolvedIEvent(this.eventName, this.options, target);
  }
}

export function ievent(
    eventName: string,
    options: Partial<Options> = {},
): UnresolvedIEvent {
  return new UnresolvedIEvent(eventName, {...DEFAULT_OPTIONS, ...options});
}
