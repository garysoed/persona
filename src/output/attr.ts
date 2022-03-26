import {OperatorFunction, pipe} from 'rxjs';
import {tap} from 'rxjs/operators';

import {ApiType, IOType, OAttr} from '../types/io';


class ResolvedOAttr implements OAttr {
  readonly apiType = ApiType.ATTR;
  readonly ioType = IOType.OUTPUT;

  constructor(
      readonly attrName: string,
  ) {}

  resolve(target: HTMLElement): () => OperatorFunction<string|null, string|null> {
    return () => pipe(
        tap(newValue => {
          if (!newValue) {
            target.removeAttribute(this.attrName);
          } else {
            target.setAttribute(this.attrName, newValue);
          }
        }),
    );
  }
}

export function oattr(attrName: string): ResolvedOAttr {
  return new ResolvedOAttr(attrName);
}
