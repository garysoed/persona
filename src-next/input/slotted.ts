import {cache} from 'gs-tools/export/data';
import {fromEvent, Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

import {Resolved, UnresolvedIO} from '../types/ctrl';
import {ApiType, IOType, ISlotted} from '../types/io';


class ResolvedISlotted implements Resolved<UnresolvedISlotted> {
  readonly apiType = ApiType.SLOTTED;
  readonly ioType = IOType.INPUT;

  constructor(
      readonly target: HTMLElement,
  ) {}

  @cache()
  get value$(): Observable<readonly Node[]> {
    return fromEvent(this.target, 'slotchange').pipe(
        startWith({}),
        map(() => {
          if (!(this.target instanceof HTMLSlotElement)) {
            return [];
          }
          return this.target.assignedNodes();
        }),
    );
  }
}

class UnresolvedISlotted implements UnresolvedIO<ISlotted> {
  readonly apiType = ApiType.SLOTTED;
  readonly ioType = IOType.INPUT;

  resolve(target: HTMLElement): ResolvedISlotted {
    return new ResolvedISlotted(target);
  }
}

export function islotted(): UnresolvedISlotted {
  return new UnresolvedISlotted();
}
