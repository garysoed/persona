import { Converter } from 'nabu';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PersonaContext } from '../core/persona-context';
import { Input } from '../types/input';
import { Resolver } from '../types/resolver';
import { UnresolvedElementProperty } from '../types/unresolved-element-property';
import { attributeObservable } from '../util/attribute-observable';


export class AttributeInput<T> implements Input<T> {
  constructor(
      readonly attrName: string,
      readonly parser: Converter<T, string>,
      readonly defaultValue: T,
      readonly resolver: Resolver<Element>,
  ) { }

  getValue(context: PersonaContext): Observable<T> {
    return this.getAttributeValue(context).pipe(
        map(unparsed => this.parseValue(unparsed)),
    );
  }

  protected getAttributeValue(context: PersonaContext): Observable<string> {
    return attributeObservable(
        this.attrName,
        unparsed => unparsed,
        this.resolver(context),
    );
  }

  private parseValue(unparsed: string): T {
    const parseResult = this.parser.convertBackward(unparsed);
    if (!parseResult.success) {
      return this.defaultValue;
    }

    return parseResult.result;
  }
}

export class UnresolvedAttributeInput<T> implements
    UnresolvedElementProperty<Element, AttributeInput<T>> {
  constructor(
      readonly attrName: string,
      readonly parser: Converter<T, string>,
      readonly defaultValue: T,
  ) { }

  createAttributePair(value: T): readonly [string, string] {
    const result = this.parser.convertForward(value);
    if (!result.success) {
      throw new Error(`Invalid value: ${value}`);
    }

    return [this.attrName, result.result];
  }

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
    defaultValue: T,
): UnresolvedAttributeInput<T>;
export function attribute<T>(
    attrName: string,
    parser: Converter<T, string>,
): UnresolvedAttributeInput<T|undefined>;
export function attribute<T>(
    attrName: string,
    parser: Converter<T, string>,
    defaultValue?: T,
): UnresolvedAttributeInput<T>|UnresolvedAttributeInput<T|undefined> {
  return new UnresolvedAttributeInput(attrName, parser, defaultValue);
}
