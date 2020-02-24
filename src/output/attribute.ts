import { Converter } from 'nabu';
import { Observable } from 'rxjs';
import { tap, withLatestFrom } from 'rxjs/operators';

import { Output } from '../types/output';
import { Resolver } from '../types/resolver';
import { ShadowRootLike } from '../types/shadow-root-like';
import { UnresolvedElementProperty } from '../types/unresolved-element-property';


export class AttributeOutput<T> implements Output<T> {
  constructor(
      readonly attrName: string,
      readonly parser: Converter<T, string>,
      readonly defaultValue: T|undefined,
      readonly resolver: Resolver<HTMLElement>,
  ) { }

  output(root: ShadowRootLike, valueObs: Observable<T>): Observable<unknown> {
    return valueObs
        .pipe(
            withLatestFrom(this.resolver(root)),
            tap(([value, el]) => {
              const result = this.parser.convertForward(value);
              if (result.success) {
                el.setAttribute(this.attrName, result.result);
              }

              if (value === this.defaultValue) {
                el.removeAttribute(this.attrName);
              }
            }),
        );
  }
}

export class UnresolvedAttributeOutput<T> implements
    UnresolvedElementProperty<HTMLElement, AttributeOutput<T>> {
  constructor(
      readonly attrName: string,
      readonly parser: Converter<T, string>,
      readonly deleteValue: T|undefined,
  ) { }

  resolve(resolver: Resolver<HTMLElement>): AttributeOutput<T> {
    return new AttributeOutput(this.attrName, this.parser, this.deleteValue, resolver);
  }
}

export function attribute<T>(
    attrName: string,
    parser: Converter<T, string>,
    deleteValue?: T,
): UnresolvedAttributeOutput<T> {
  return new UnresolvedAttributeOutput(attrName, parser, deleteValue);
}
