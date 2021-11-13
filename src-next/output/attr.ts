import {OperatorFunction, pipe} from 'rxjs';
import {startWith, tap} from 'rxjs/operators';

import {Resolved, UnresolvedIO} from '../types/ctrl';
import {ApiType, IOType, OAttr} from '../types/io';


class ResolvedOAttr implements Resolved<UnresolvedOAttr> {
  readonly apiType = ApiType.ATTR;
  readonly ioType = IOType.OUTPUT;

  constructor(
      readonly attrName: string,
      readonly defaultValue: string|null,
      readonly target: HTMLElement,
  ) {}

  update(): OperatorFunction<string|null, unknown> {
    return pipe(
        startWith(this.defaultValue),
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

export class UnresolvedOAttr implements UnresolvedIO<OAttr> {
  readonly apiType = ApiType.ATTR;
  readonly ioType = IOType.OUTPUT;

  constructor(
      readonly attrName: string,
      readonly defaultValue: string|null,
  ) {}

  resolve(target: HTMLElement): ResolvedOAttr {
    return new ResolvedOAttr(
        this.attrName,
        this.defaultValue,
        target,
    );
  }
}

export function oattr(attrName: string, startValue: string): UnresolvedOAttr;
export function oattr(attrName: string): UnresolvedOAttr;
export function oattr(attrName: string, defaultValue?: string): UnresolvedOAttr {
  return new UnresolvedOAttr(attrName, defaultValue ?? null);
}
