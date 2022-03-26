import {OperatorFunction, throwError} from 'rxjs';
import {switchMapTo} from 'rxjs/operators';

import {ApiType, IOType, OSlotted} from '../types/io';


class ResolvedOSlotted implements OSlotted {
  readonly apiType = ApiType.SLOTTED;
  readonly ioType = IOType.OUTPUT;

  resolve(): () => OperatorFunction<readonly Node[], readonly Node[]> {
    return () => switchMapTo(throwError(new Error('oslotted cannot be set')));
  }
}

export function oslotted(): ResolvedOSlotted {
  return new ResolvedOSlotted();
}
