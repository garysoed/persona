import { Errors } from '@gs-tools/error';
import { Converter } from '@nabu';
import { Observable } from '@rxjs';

import { Input } from '../types/input';
import { Resolver } from '../types/resolver';
import { ShadowRootLike } from '../types/shadow-root-like';
import { UnresolvedElementProperty } from '../types/unresolved-element-property';
import { attributeObservable } from '../util/attribute-observable';

export class AttributeInput<T> implements Input<T> {
  constructor(
      readonly attrName: string,
      readonly parser: Converter<T, string>,
      readonly defaultValue: T|undefined,
      readonly resolver: Resolver<Element>,
  ) { }

  getValue(root: ShadowRootLike): Observable<T> {
    return attributeObservable(
        this.attrName,
        unparsed => this.parseValue(unparsed),
        this.resolver(root),
    );
  }

  private parseValue(unparsed: string): T {
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

  resolve(resolver: Resolver<Element>): AttributeInput<T> {
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
