import { Converter } from '@nabu/main';
import { Observable } from 'rxjs';
import { tap, withLatestFrom } from 'rxjs/operators';
import { Output } from '../component/output';
import { UnresolvedElementProperty } from '../component/unresolved-element-property';

export class AttributeOutput<T> implements Output<T> {
  constructor(
      readonly attrName: string,
      readonly parser: Converter<T, string>,
      readonly defaultValue: T|undefined,
      readonly resolver: (root: ShadowRoot) => Observable<Element>,
  ) { }

  output(root: ShadowRoot, valueObs: Observable<T>): Observable<unknown> {
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
    UnresolvedElementProperty<Element, AttributeOutput<T>> {
  constructor(
      readonly attrName: string,
      readonly parser: Converter<T, string>,
      readonly deleteValue: T|undefined,
  ) { }

  resolve(resolver: (root: ShadowRoot) => Observable<Element>): AttributeOutput<T> {
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
