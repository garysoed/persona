import {OperatorFunction, pipe} from 'rxjs';
import {tap} from 'rxjs/operators';

import {Resolved} from '../types/ctrl';
import {ApiType, IOType, OClass} from '../types/io';


class ResolvedOClass implements Resolved<OClass> {
  readonly apiType = ApiType.CLASS;
  readonly ioType = IOType.OUTPUT;

  constructor(
      readonly className: string,
  ) {}

  resolve(target: HTMLElement): () => OperatorFunction<boolean, boolean> {
    return () => pipe(
        tap(newValue => {
          if (!newValue) {
            target.classList.remove(this.className);
          } else {
            target.classList.add(this.className);
          }
        }),
    );
  }
}

export function oclass(className: string): ResolvedOClass {
  return new ResolvedOClass(className);
}
