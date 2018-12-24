import { InstanceStreamId, instanceStreamId } from 'grapevine/export/component';
import { Errors } from 'gs-tools/export/error';
import { Type } from 'gs-types/export';
import { Converter } from 'nabu/export/main';
import { Observable } from 'rxjs';
import { Input } from '../component/input';
import { UnresolvedElementProperty } from '../component/unresolved-element-property';
import { attributeObservable } from '../util/attribute-observable';

export class AttributeInput<T> implements Input<T> {
  readonly id: InstanceStreamId<T>;

  constructor(
      readonly attrName: string,
      readonly parser: Converter<T, string>,
      private readonly type: Type<T>,
      readonly resolver: (root: ShadowRoot) => Observable<Element>,
      private readonly defaultValue?: T,
  ) {
    this.id = instanceStreamId(`attr[${attrName}]`, type);
  }

  getValue(root: ShadowRoot): Observable<T> {
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
        throw Errors.assert(`Value of ${this.attrName}`)
            .shouldBeA(this.type)
            .butWas(unparsed);
      }
    }

    return parseResult.result;
  }
}

class UnresolvedAttributeInput<T> implements UnresolvedElementProperty<Element, AttributeInput<T>> {
  constructor(
      private readonly attrName: string,
      private readonly parser: Converter<T, string>,
      private readonly type: Type<T>,
      private readonly defaultValue?: T,
  ) { }

  resolve(resolver: (root: ShadowRoot) => Observable<Element>): AttributeInput<T> {
    return new AttributeInput(
        this.attrName,
        this.parser,
        this.type,
        resolver,
        this.defaultValue,
    );
  }
}

export function attribute<T>(
    attrName: string,
    parser: Converter<T, string>,
    type: Type<T>,
    defaultValue?: T,
): UnresolvedAttributeInput<T> {
  return new UnresolvedAttributeInput(attrName, parser, type, defaultValue);
}
