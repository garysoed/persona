import { Converter } from 'nabu/export/main';
import { combineLatest, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Output } from '../component/output';
import { UnresolvedElementProperty } from '../component/unresolved-element-property';

type ShouldDelete<T> = (value: T) => boolean;

export class AttributeOutput<T> implements Output<T> {
  constructor(
      private readonly attrName: string,
      private readonly parser: Converter<T, string>,
      private readonly shouldDelete: ShouldDelete<T>,
      private readonly resolver: (root: ShadowRoot) => Observable<Element>,
  ) { }

  output(root: ShadowRoot, valueObs: Observable<T>): Observable<unknown> {
    return combineLatest(this.resolver(root), valueObs)
        .pipe(
            tap(([el, value]) => {
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
