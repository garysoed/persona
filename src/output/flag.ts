import {OperatorFunction, pipe} from 'rxjs';
import {tap} from 'rxjs/operators';

import {ApiType, IOType, OFlag} from '../types/io';

class ResolvedOFlag implements OFlag {
  readonly apiType = ApiType.FLAG;
  readonly ioType = IOType.OUTPUT;

  constructor(readonly attrName: string) {}

  resolve(target: Element): () => OperatorFunction<boolean, boolean> {
    return () =>
      pipe(
        tap((hasAttribute) => {
          if (!hasAttribute) {
            target.removeAttribute(this.attrName);
          } else {
            target.setAttribute(this.attrName, '');
          }
        }),
      );
  }
}

export function oflag(attrName: string): ResolvedOFlag {
  return new ResolvedOFlag(attrName);
}
