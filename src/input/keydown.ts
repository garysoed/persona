import {cache} from 'gs-tools/export/data';
import {filterByType} from 'gs-tools/export/rxjs';
import {booleanType, instanceofType} from 'gs-types';
import {fromEvent, Observable} from 'rxjs';
import {filter} from 'rxjs/operators';

import {Resolved, UnresolvedIO} from '../types/ctrl';
import {ApiType, IKeydown, IOType} from '../types/io';
import {KeyMatchOptions} from '../types/key-match-options';


class ResolvedIKeydown implements Resolved<UnresolvedIKeydown> {
  readonly apiType = ApiType.KEYDOWN;
  readonly ioType = IOType.INPUT;

  constructor(
    readonly key: string,
    readonly matchOptions: KeyMatchOptions,
    readonly target: HTMLElement,
  ) {}

  @cache()
  get value$(): Observable<KeyboardEvent> {
    return fromEvent(this.target, 'keydown').pipe(
        filterByType(instanceofType(KeyboardEvent)),
        filter(event => {
          if (event.key !== this.key) {
            return false;
          }

          if (booleanType.check(this.matchOptions.alt)
            && this.matchOptions.alt !== event.altKey) {
            return false;
          }

          if (booleanType.check(this.matchOptions.ctrl)
            && this.matchOptions.ctrl !== event.ctrlKey) {
            return false;
          }

          if (booleanType.check(this.matchOptions.meta)
            && this.matchOptions.meta !== event.metaKey) {
            return false;
          }

          if (booleanType.check(this.matchOptions.shift)
            && this.matchOptions.shift !== event.shiftKey) {
            return false;
          }

          return true;
        }),

    );
  }
}

export class UnresolvedIKeydown implements UnresolvedIO<HTMLElement, IKeydown> {
  readonly apiType = ApiType.KEYDOWN;
  readonly ioType = IOType.INPUT;

  constructor(
      readonly key: string,
      readonly matchOptions: KeyMatchOptions,
  ) {}

  resolve(target: HTMLElement): ResolvedIKeydown {
    return new ResolvedIKeydown(this.key, this.matchOptions, target);
  }
}

export function ikeydown(key: string, matchOptions: KeyMatchOptions = {}): UnresolvedIKeydown {
  return new UnresolvedIKeydown(key, matchOptions);
}
