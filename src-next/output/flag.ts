import {OperatorFunction, pipe} from 'rxjs';
import {tap} from 'rxjs/operators';

import {Resolved, UnresolvedIO} from '../types/ctrl';
import {ApiType, IOType, OFlag} from '../types/io';


class ResolvedOFlag implements Resolved<UnresolvedOFlag> {
  readonly apiType = ApiType.FLAG;
  readonly ioType = IOType.OUTPUT;

  constructor(
      readonly attrName: string,
      readonly target: HTMLElement,
  ) {}

  update(): OperatorFunction<boolean, unknown> {
    return pipe(
        tap(hasAttribute => {
          if (!hasAttribute) {
            this.target.removeAttribute(this.attrName);
          } else {
            this.target.setAttribute(this.attrName, '');
          }
        }),
    );
  }
}

export class UnresolvedOFlag implements UnresolvedIO<OFlag> {
  readonly apiType = ApiType.FLAG;
  readonly ioType = IOType.OUTPUT;

  constructor(
      readonly attrName: string,
  ) {}

  resolve(target: HTMLElement): ResolvedOFlag {
    return new ResolvedOFlag(
        this.attrName,
        target,
    );
  }
}

export function oflag(attrName: string): UnresolvedOFlag {
  return new UnresolvedOFlag(attrName);
}
