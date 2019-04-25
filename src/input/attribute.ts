import { Errors } from '@gs-tools/error';
import { Converter } from '@nabu/main';
import { Observable } from 'rxjs';
import { Input } from '../component/input';
import { UnresolvedElementProperty } from '../component/unresolved-element-property';
import { attributeObservable } from '../util/attribute-observable';

export class AttributeInput<T> implements Input<T> {
  constructor(
      readonly attrName: string,
      readonly parser: Converter<T, string>,
      readonly defaultValue: T|undefined,
      readonly resolver: (root: ShadowRoot) => Observable<Element>,
  ) { }

  getValue(root: ShadowRoot): Observable<T> {
    return attributeObservable(
        this.attrName,
        unparsed => this.parseValue(unparsed, root),
        this.resolver(root),
    );
  }

  private parseValue(unparsed: string, root: any): T {
    const parseResult = this.parser.convertBackward(unparsed);
    if (!parseResult.success) {
      if (this.defaultValue !== undefined) {
        return this.defaultValue;
      } else {
        throw Errors.assert(`Value of ${this.attrName}`).shouldBe('parsable').butWas(unparsed);
      }
    }

    return parseResult.result;
  }
}

export class UnresolvedAttributeInput<T> implements
    UnresolvedElementProperty<Element, AttributeInput<T>> {
  constructor(
      readonly attrName: string,
      readonly parser: Converter<T, string>,
      readonly defaultValue: T|undefined,
  ) { }

  resolve(resolver: (root: ShadowRoot) => Observable<Element>): AttributeInput<T> {
    return new AttributeInput(
        this.attrName,
        this.parser,
        this.defaultValue,
        resolver,
    );
  }
}

export function attribute<T>(
    attrName: string,
    parser: Converter<T, string>,
    defaultValue?: T,
): UnresolvedAttributeInput<T> {
  return new UnresolvedAttributeInput(attrName, parser, defaultValue);
}
