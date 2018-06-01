import { instanceSourceId } from 'grapevine/export/component';
import { VineImpl } from 'grapevine/export/main';
import { Parser } from 'gs-tools/export/parse';
import { Type } from 'gs-types/export';
import { AttributeWatcher } from '../watcher/attribute-watcher';
import { ElementLocator, ResolvedElementLocator, UnresolvedElementLocator } from './element-locator';
import { ResolvedLocator, UnresolvedLocator } from './locator';

/**
 * @internal
 */
export class ResolvedAttributeLocator<T> extends ResolvedLocator<T> {
  constructor(
      private readonly elementLocator_: ResolvedElementLocator<HTMLElement>,
      private readonly attrName_: string,
      private readonly parser_: Parser<T>,
      type: Type<T>) {
    super(
        instanceSourceId(`${elementLocator_.getSelectorString()}[${attrName_}]`, type),
        type);
  }

  createWatcher(vine: VineImpl): AttributeWatcher<T> {
    return new AttributeWatcher(
        this.elementLocator_.createWatcher(vine),
        this.elementLocator_.getSourceId(),
        this.parser_,
        this.attrName_,
        this.sourceId_,
        vine);
  }

  toString(): string {
    return `ResolvedAttributeLocator(${this.sourceId_})`;
  }
}

/**
 * @internal
 */
export class UnresolvedAttributeLocator<T> extends UnresolvedLocator<T> {
  constructor(
      private readonly elementLocator_: UnresolvedElementLocator<HTMLElement>,
      private readonly attrName_: string,
      private readonly parser_: Parser<T>,
      private readonly type_: Type<T>) {
    super();
  }

  resolve(resolver: <S>(path: string, type: Type<S>) => S): ResolvedAttributeLocator<T> {
    return new ResolvedAttributeLocator(
        this.elementLocator_.resolve(resolver),
        this.attrName_,
        this.parser_,
        this.type_);
  }

  toString(): string {
    return `UnresolvedAttributeLocator(${this.elementLocator_}[${this.attrName_}])`;
  }
}

type AttributeLocator<T> =
    ResolvedAttributeLocator<T> | UnresolvedAttributeLocator<T>;

/**
 * Creates selector that selects an element.
 */
export function attribute<T>(
    elementLocator: ResolvedElementLocator<HTMLElement>,
    attrName: string,
    parser: Parser<T>,
    type: Type<T>): ResolvedAttributeLocator<T>;
export function attribute<T>(
    elementLocator: UnresolvedElementLocator<HTMLElement>,
    attrName: string,
    parser: Parser<T>,
    type: Type<T>): UnresolvedAttributeLocator<T>;
export function attribute<T>(
    elementLocator: ElementLocator<HTMLElement>,
    attrName: string,
    parser: Parser<T>,
    type: Type<T>): AttributeLocator<T> {
  if (elementLocator instanceof ResolvedElementLocator) {
    return new ResolvedAttributeLocator(elementLocator, attrName, parser, type);
  } else {
    return new UnresolvedAttributeLocator(elementLocator, attrName, parser, type);
  }
}
