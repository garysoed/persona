import {OperatorFunction, pipe} from 'rxjs';
import {tap} from 'rxjs/operators';

import {Resolved, UnresolvedIO} from '../types/ctrl';
import {ApiType, IOType, OAttr} from '../types/io';


class ResolvedOAttr implements Resolved<UnresolvedOAttr> {
  readonly apiType = ApiType.ATTR;
  readonly ioType = IOType.OUTPUT;

  constructor(
      readonly attrName: string,
      readonly target: HTMLElement,
  ) {}

  update(): OperatorFunction<string|null, string|null> {
    return pipe(
        tap(newValue => {
          if (!newValue) {
            this.target.removeAttribute(this.attrName);
          } else {
            this.target.setAttribute(this.attrName, newValue);
          }
        }),
    );
  }
}

class UnresolvedOAttr implements UnresolvedIO<OAttr> {
  readonly apiType = ApiType.ATTR;
  readonly ioType = IOType.OUTPUT;

  constructor(
      readonly attrName: string,
  ) {}

  resolve(target: HTMLElement): ResolvedOAttr {
    return new ResolvedOAttr(
        this.attrName,
        target,
    );
  }
}

export function oattr(attrName: string): UnresolvedOAttr {
  return new UnresolvedOAttr(attrName);
}
