import { instanceSourceId, instanceStreamId, InstanceStreamId } from 'grapevine/export/component';
import { VineBuilder, VineImpl } from 'grapevine/export/main';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { Parser } from 'gs-tools/export/parse';
import { TupleOfType, Type } from 'gs-types/export';
import { AttributeWatcher } from '../watcher/attribute-watcher';
import { ResolvedLocator, ResolvedRenderableLocator, UnresolvedLocator } from './locator';

function generateVineId(elementLocator: ResolvedLocator<HTMLElement|null>, attrName: string):
    string {
  return `${elementLocator}[${attrName}]`;
}

/**
 * @internal
 */
export class ResolvedAttributeLocator<T> extends ResolvedRenderableLocator<T> {
  private readonly innerRenderStreamId_: InstanceStreamId<[HTMLElement|null, T]>;

  constructor(
      private readonly elementLocator_: ResolvedLocator<HTMLElement|null>,
      private readonly attrName_: string,
      private readonly parser_: Parser<T>,
      type: Type<T>) {
    super(
        instanceStreamId(generateVineId(elementLocator_, attrName_), type),
        instanceSourceId(generateVineId(elementLocator_, attrName_), type));
    this.innerRenderStreamId_ = instanceStreamId(
        `${generateVineId(elementLocator_, attrName_)}@private`,
        TupleOfType<HTMLElement|null, T>([elementLocator_.getType(), type]));
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

  setupVine(builder: VineBuilder): void {
    builder.stream(
        this.innerRenderStreamId_,
        (attrEl, value) => [attrEl, value],
        this.elementLocator_.getSourceId(),
        this.streamId_);
  }

  startRender(vine: VineImpl, context: BaseDisposable): () => void {
    return vine.listen(this.innerRenderStreamId_, ([attrEl, attr]) => {
      if (!attrEl) {
        return;
      }
      attrEl.setAttribute(this.attrName_, this.parser_.stringify(attr));
    }, context);
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
      private readonly elementLocator_: UnresolvedLocator<HTMLElement|null>,
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
    elementLocator: ResolvedLocator<HTMLElement|null>,
    attrName: string,
    parser: Parser<T>,
    type: Type<T>): ResolvedAttributeLocator<T>;
export function attribute<T>(
    elementLocator: UnresolvedLocator<HTMLElement|null>,
    attrName: string,
    parser: Parser<T>,
    type: Type<T>): UnresolvedAttributeLocator<T>;
export function attribute<T>(
    elementLocator: ResolvedLocator<HTMLElement|null> | UnresolvedLocator<HTMLElement|null>,
    attrName: string,
    parser: Parser<T>,
    type: Type<T>): AttributeLocator<T> {
  if (elementLocator instanceof ResolvedLocator) {
    return new ResolvedAttributeLocator(elementLocator, attrName, parser, type);
  } else {
    return new UnresolvedAttributeLocator(elementLocator, attrName, parser, type);
  }
}
