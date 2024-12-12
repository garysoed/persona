import {defer, Observable} from 'rxjs';
import {filter, map, startWith} from 'rxjs/operators';

import {ApiType, IFlag, IOType} from '../types/io';
import {getAttributeChangeObservable} from '../util/attribute-change-observable';
import {mutationObservable} from '../util/mutation-observable';

class ResolvedIFlag implements IFlag {
  readonly apiType = ApiType.FLAG;
  readonly ioType = IOType.INPUT;

  constructor(readonly attrName: string) {}

  resolve(target: Element): Observable<boolean> {
    // Only start checking on subscription.
    return defer(() => {
      const obs$ = getAttributeChangeObservable(target);
      if (!obs$) {
        return mutationObservable(target, {
          attributeFilter: [this.attrName],
          attributes: true,
        });
      }

      return obs$.pipe(filter((event) => event.attrName === this.attrName));
    }).pipe(
      startWith({}),
      map(() => target.hasAttribute(this.attrName)),
    );
  }
}

export function iflag(attrName: string): ResolvedIFlag {
  return new ResolvedIFlag(attrName);
}
