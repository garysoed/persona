import {Converter} from 'nabu';
import {Observable} from 'rxjs';
import {distinctUntilChanged, map} from 'rxjs/operators';

import {ShadowContext} from '../core/shadow-context';
import {Input} from '../types/input';
import {Resolver} from '../types/resolver';
import {UnresolvedElementProperty} from '../types/unresolved-element-property';
import {UnresolvedInput} from '../types/unresolved-input';
import {attributeObservable} from '../util/attribute-observable';


export class AttributeInput<T> implements Input<T> {
  constructor(
      readonly attrName: string,
      readonly parser: Converter<T, string>,
      readonly defaultValue: T,
      readonly resolver: Resolver<Element>,
  ) { }

  getValue(context: ShadowContext): Observable<T> {
    return this.getAttributeValue(context).pipe(
        distinctUntilChanged(),
        map(unparsed => this.parseValue(unparsed)),
    );
  }

  protected getAttributeValue(context: ShadowContext): Observable<string> {
    return attributeObservable(
        this.resolver(context),
        this.attrName,
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
    UnresolvedElementProperty<Element, AttributeInput<T>>, UnresolvedInput<T> {
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
