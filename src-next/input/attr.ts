import {cache} from 'gs-tools/export/data';
import {defer, Observable, throwError} from 'rxjs';
import {filter, map, startWith} from 'rxjs/operators';

import {Resolved, UnresolvedIO} from '../types/ctrl';
import {ApiType, IAttr, IOType} from '../types/io';
import {getAttributeChangeObservable} from '../util/attribute-change-observable';


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
        return throwError(new Error(`No attribute change observable found for ${this.target.tagName}`));
      }

      return obs$;
    })
        .pipe(
            startWith({attrName: this.attrName}),
            filter(event => event.attrName === this.attrName),
            map(() => this.target.getAttribute(this.attrName)),
        );
  }
}

export class UnresolvedIAttr implements UnresolvedIO<IAttr> {
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
