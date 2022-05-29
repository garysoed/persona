import {Converter, identity, mapForward} from 'nabu';
import {defer, Observable, throwError} from 'rxjs';
import {filter, map, startWith} from 'rxjs/operators';

import {ApiType, IAttr, IOType} from '../types/io';
import {getAttributeChangeObservable} from '../util/attribute-change-observable';
import {mutationObservable} from '../util/mutation-observable';


class ResolvedIAttr<T> implements IAttr<T> {
  readonly apiType = ApiType.ATTR;
  readonly ioType = IOType.INPUT;

  constructor(
      readonly attrName: string,
      readonly converter: Converter<string|null, T|null>,
  ) {}

  resolve(target: Element): Observable<T|null> {
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
            mapForward(
                this.converter,
                value => throwError(`Invalid value of attribute ${this.attrName}: ${value}`),
            ),
        );
  }
}

export function iattr(attrName: string): ResolvedIAttr<string>;
export function iattr<T>(attrName: string, converter: Converter<string|null, T|null>): ResolvedIAttr<T>;
export function iattr<T>(attrName: string, converter?: Converter<string|null, T|null>): ResolvedIAttr<any> {
  if (converter) {
    return new ResolvedIAttr(attrName, converter);
  }
  return new ResolvedIAttr(attrName, identity());
}
