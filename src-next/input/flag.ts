import {cache} from 'gs-tools/export/data';
import {defer, Observable} from 'rxjs';
import {filter, map, startWith} from 'rxjs/operators';

import {Resolved, UnresolvedIO} from '../types/ctrl';
import {ApiType, IFlag, IOType} from '../types/io';
import {getAttributeChangeObservable} from '../util/attribute-change-observable';
import {mutationObservable} from '../util/mutation-observable';


class ResolvedIFlag implements Resolved<UnresolvedIFlag> {
  readonly apiType = ApiType.FLAG;
  readonly ioType = IOType.INPUT;

  constructor(
      readonly attrName: string,
      readonly target: HTMLElement,
  ) {}

  @cache()
  get value$(): Observable<boolean> {
    // Only start checking on subscription.
    return defer(() => {
      const obs$ = getAttributeChangeObservable(this.target);
      if (!obs$) {
        return mutationObservable(
            this.target,
            {attributes: true, attributeFilter: [this.attrName]},
        );
      }

      return obs$.pipe(
          filter(event => event.attrName === this.attrName),
      );
    })
        .pipe(
            startWith({}),
            map(() => this.target.hasAttribute(this.attrName)),
        );
  }
}

class UnresolvedIFlag implements UnresolvedIO<IFlag> {
  readonly apiType = ApiType.FLAG;
  readonly ioType = IOType.INPUT;

  constructor(
      readonly attrName: string,
  ) {}

  resolve(target: HTMLElement): ResolvedIFlag {
    return new ResolvedIFlag(this.attrName, target);
  }
}

export function iflag(attrName: string): UnresolvedIFlag {
  return new UnresolvedIFlag(attrName);
}
