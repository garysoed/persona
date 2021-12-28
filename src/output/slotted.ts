import {OperatorFunction, throwError} from 'rxjs';
import {switchMapTo} from 'rxjs/operators';

import {Resolved, UnresolvedIO} from '../types/ctrl';
import {ApiType, IOType, OSlotted} from '../types/io';


class ResolvedOSlotted implements Resolved<UnresolvedOSlotted> {
  readonly apiType = ApiType.SLOTTED;
  readonly ioType = IOType.OUTPUT;

  constructor(
      readonly target: HTMLElement,
  ) {}

  update(): OperatorFunction<readonly Node[], readonly Node[]> {
    return switchMapTo(throwError(new Error('oslotted cannot be set')));
  }
}


class UnresolvedOSlotted implements UnresolvedIO<OSlotted> {
  readonly apiType = ApiType.SLOTTED;
  readonly ioType = IOType.OUTPUT;

  resolve(target: HTMLElement): ResolvedOSlotted {
    return new ResolvedOSlotted(target);
  }
}

export function oslotted(): UnresolvedOSlotted {
  return new UnresolvedOSlotted();
}
