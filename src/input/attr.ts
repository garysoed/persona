import {cache} from 'gs-tools/export/data';
import {defer, Observable} from 'rxjs';
import {filter, map, startWith} from 'rxjs/operators';

import {Resolved, UnresolvedIO} from '../types/ctrl';
import {ApiType, IAttr, IOType} from '../types/io';
import {getAttributeChangeObservable} from '../util/attribute-change-observable';
import {mutationObservable} from '../util/mutation-observable';


class ResolvedIAttr implements Resolved<UnresolvedIAttr> {
  readonly apiType = ApiType.ATTR;
  readonly ioType = IOType.INPUT;

  constructor(
      readonly attrName: string,
      readonly target: HTMLElement,
  ) {}

  @cache()
  get value$(): Observable<string|null> {
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
            map(() => this.target.getAttribute(this.attrName)),
        );
  }
}

class UnresolvedIAttr implements UnresolvedIO<HTMLElement, IAttr> {
  readonly apiType = ApiType.ATTR;
  readonly ioType = IOType.INPUT;

  constructor(
      readonly attrName: string,
  ) {}

  resolve(target: HTMLElement): ResolvedIAttr {
    return new ResolvedIAttr(this.attrName, target);
  }
}

export function iattr(attrName: string): UnresolvedIAttr {
  return new UnresolvedIAttr(attrName);
}
