import {fromEvent, Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

import {ApiType, IOType, ISlotted} from '../types/io';


class ResolvedISlotted implements ISlotted {
  readonly apiType = ApiType.SLOTTED;
  readonly ioType = IOType.INPUT;

  resolve(target: HTMLElement): Observable<readonly Node[]> {
    return fromEvent(target, 'slotchange').pipe(
        startWith({}),
        map(() => {
          if (!(target instanceof HTMLSlotElement)) {
            return [];
          }
          return target.assignedNodes();
        }),
    );
  }
}

export function islotted(): ResolvedISlotted {
  return new ResolvedISlotted();
}
