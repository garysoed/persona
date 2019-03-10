import { Converter } from 'nabu/export/main';
import { Observable } from 'rxjs';
import { tap, withLatestFrom } from 'rxjs/operators';
import { Output } from '../component/output';
import { UnresolvedElementProperty } from '../component/unresolved-element-property';

type ShouldDelete<T> = (value: T) => boolean;

export class AttributeOutput<T> implements Output<T> {
  constructor(
      readonly attrName: string,
      readonly parser: Converter<T, string>,
      private readonly shouldDelete: ShouldDelete<T>,
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

              if (this.shouldDelete(value)) {
                el.removeAttribute(this.attrName);
              }
            }),
        );
  }
}

class UnresolvedAttributeOutput<T> implements
    UnresolvedElementProperty<Element, AttributeOutput<T>> {
  constructor(
      private readonly attrName: string,
      private readonly parser: Converter<T, string>,
      private readonly shouldDelete: ShouldDelete<T>,
  ) { }

  resolve(resolver: (root: ShadowRoot) => Observable<Element>): AttributeOutput<T> {
    return new AttributeOutput(this.attrName, this.parser, this.shouldDelete, resolver);
  }
}

export function attribute<T>(
    attrName: string,
    parser: Converter<T, string>,
    shouldDelete: ShouldDelete<T> = () => false,
): UnresolvedAttributeOutput<T> {
  return new UnresolvedAttributeOutput(attrName, parser, shouldDelete);
}
