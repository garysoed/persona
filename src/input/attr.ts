import {defer, Observable} from 'rxjs';
import {filter, map, startWith} from 'rxjs/operators';

import {Reference} from '../types/ctrl';
import {ApiType, IAttr, IOType} from '../types/io';
import {getAttributeChangeObservable} from '../util/attribute-change-observable';
import {mutationObservable} from '../util/mutation-observable';


class ResolvedIAttr implements Reference<IAttr> {
  readonly apiType = ApiType.ATTR;
  readonly ioType = IOType.INPUT;

  constructor(
      readonly attrName: string,
  ) {}

  resolve(target: HTMLElement): Observable<string|null> {
    // Only start checking on subscription.
    return defer(() => {
      const obs$ = getAttributeChangeObservable(target);
      if (!obs$) {
        return mutationObservable(
            target,
            {attributes: true, attributeFilter: [this.attrName]},
        );
      }

      return obs$.pipe(
          filter(event => event.attrName === this.attrName),
      );
    })
        .pipe(
            startWith({}),
            map(() => target.getAttribute(this.attrName)),
        );
  }
}

export function iattr(attrName: string): ResolvedIAttr {
  return new ResolvedIAttr(attrName);
}
