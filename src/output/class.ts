import {OperatorFunction, pipe} from 'rxjs';
import {tap} from 'rxjs/operators';

import {Resolved, UnresolvedIO} from '../types/ctrl';
import {ApiType, IOType, OClass} from '../types/io';


class ResolvedOClass implements Resolved<UnresolvedOClass> {
  readonly apiType = ApiType.CLASS;
  readonly ioType = IOType.OUTPUT;

  constructor(
      readonly className: string,
      readonly target: HTMLElement,
  ) {}

  update(): OperatorFunction<boolean, boolean> {
    return pipe(
        tap(newValue => {
          if (!newValue) {
            this.target.classList.remove(this.className);
          } else {
            this.target.classList.add(this.className);
          }
        }),
    );
  }
}

class UnresolvedOClass implements UnresolvedIO<OClass> {
  readonly apiType = ApiType.CLASS;
  readonly ioType = IOType.OUTPUT;

  constructor(
      readonly className: string,
  ) {}

  resolve(target: HTMLElement): ResolvedOClass {
    return new ResolvedOClass(
        this.className,
        target,
    );
  }
}

export function oclass(className: string): UnresolvedOClass {
  return new UnresolvedOClass(className);
}
