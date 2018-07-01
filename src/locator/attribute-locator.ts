import { instanceSourceId, instanceStreamId } from 'grapevine/export/component';
import { VineImpl } from 'grapevine/export/main';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { Errors } from 'gs-tools/export/error';
import { Parser } from 'gs-tools/export/parse';
import { Type } from 'gs-types/export';
import { AttributeWatcher } from '../watcher/attribute-watcher';
import { ResolvedLocator, ResolvedRenderableWatchableLocator, ResolvedWatchableLocator } from './resolved-locator';
import { UnresolvedRenderableWatchableLocator, UnresolvedWatchableLocator } from './unresolved-locator';

function generateVineId(elementLocator: ResolvedLocator, attrName: string):
    string {
  return `${elementLocator}[${attrName}]`;
}

/**
 * @internal
 */
export class ResolvedAttributeLocator<T>
    extends ResolvedRenderableWatchableLocator<T> {

  constructor(
      private readonly elementLocator_: ResolvedWatchableLocator<HTMLElement|null>,
      private readonly attrName_: string,
      private readonly parser_: Parser<T>,
      type: Type<T>) {
    super(
        instanceStreamId(generateVineId(elementLocator_, attrName_), type),
        instanceSourceId(generateVineId(elementLocator_, attrName_), type));
  }

  createWatcher(): AttributeWatcher<T> {
    return new AttributeWatcher<T>(
        this.elementLocator_.createWatcher(),
        this.parser_,
        this.getType(),
        this.attrName_,
        this.getReadingId());
  }


  getValue(root: ShadowRoot): T {
    const element = this.elementLocator_.getValue(root);
    let attrValue = null;
    if (element) {
      attrValue = element.getAttribute(this.attrName_);
    }

    const value = this.parser_.parse(attrValue);
    const type = this.getType();
    if (!type.check(value)) {
      throw Errors.assert(`Value of [${this}]`).shouldBeA(type).butWas(value);
    }

    return value;
  }

  startRender(vine: VineImpl, context: BaseDisposable): () => void {
    return vine.listen((attrEl, attr) => {
      if (!attrEl) {
        return;
      }
      attrEl.setAttribute(this.attrName_, this.parser_.stringify(attr));
    }, context, this.elementLocator_.getReadingId(), this.getWritingId());
  }

  toString(): string {
    return `ResolvedAttributeLocator(${this.getReadingId()})`;
  }
}

/**
 * @internal
 */
export class UnresolvedAttributeLocator<T>
    extends UnresolvedRenderableWatchableLocator<T> {
  constructor(
      private readonly elementLocator_: UnresolvedWatchableLocator<HTMLElement|null>,
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

type AttributeLocator<T> = ResolvedAttributeLocator<T> | UnresolvedAttributeLocator<T>;

/**
 * Creates selector that selects an element.
 */
export function attribute<T>(
    elementLocator: ResolvedWatchableLocator<HTMLElement|null>,
    attrName: string,
    parser: Parser<T>,
    type: Type<T>): ResolvedAttributeLocator<T>;
export function attribute<T>(
    elementLocator: UnresolvedWatchableLocator<HTMLElement|null>,
    attrName: string,
    parser: Parser<T>,
    type: Type<T>): UnresolvedAttributeLocator<T>;
export function attribute<T>(
    elementLocator:
        ResolvedWatchableLocator<HTMLElement|null>|UnresolvedWatchableLocator<HTMLElement|null>,
    attrName: string,
    parser: Parser<T>,
    type: Type<T>): AttributeLocator<T> {
  if (elementLocator instanceof ResolvedLocator) {
    return new ResolvedAttributeLocator(elementLocator, attrName, parser, type);
  } else {
    return new UnresolvedAttributeLocator(elementLocator, attrName, parser, type);
  }
}
