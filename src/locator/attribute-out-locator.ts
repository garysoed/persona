import { instanceStreamId } from 'grapevine/export/component';
import { VineImpl } from 'grapevine/export/main';
import { ImmutableSet } from 'gs-tools/export/collect';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { Type } from 'gs-types/export';
import { Converter } from 'nabu/export/main';
import { combineLatest, Subscription } from 'rxjs';
import { ResolvedLocator, ResolvedRenderableLocator, ResolvedWatchableLocator } from './resolved-locator';
import { UnresolvedRenderableLocator, UnresolvedWatchableLocator } from './unresolved-locator';

type ShouldDelete<T> = (value: T) => boolean;

function generateVineId(elementLocator: ResolvedLocator, attrName: string): string {
  return `${elementLocator}[${attrName}]`;
}

/**
 * @internal
 */
export class ResolvedAttributeOutLocator<T> extends ResolvedRenderableLocator<T> {

  constructor(
      readonly elementLocator: ResolvedWatchableLocator<Element>,
      readonly attrName: string,
      readonly parser: Converter<T, string>,
      type: Type<T>,
      private readonly shouldDelete_: ShouldDelete<T>,
  ) {
    super(instanceStreamId(generateVineId(elementLocator, attrName), type));
  }

  getDependencies(): ImmutableSet<ResolvedWatchableLocator<any>> {
    return ImmutableSet
        .of<ResolvedWatchableLocator<any>>([this.elementLocator])
        .addAll(this.elementLocator.getDependencies());
  }

  startRender(vine: VineImpl, context: BaseDisposable): Subscription {
    return combineLatest(
        vine.getObservable(this.elementLocator.getReadingId(), context),
        vine.getObservable(this.getWritingId(), context),
        )
        .subscribe(([attrEl, attr]) => {
          if (!attrEl) {
            return;
          }

          const result = this.parser.convertForward(attr);
          if (result.success) {
            attrEl.setAttribute(this.attrName, result.result);
          }

          if (this.shouldDelete_(attr)) {
            attrEl.removeAttribute(this.attrName);
          }
        });
  }

  toString(): string {
    return `ResolvedAttributeLocator(${this.getWritingId()})`;
  }
}

/**
 * @internal
 */
export class UnresolvedAttributeOutLocator<T>
    extends UnresolvedRenderableLocator<T> {
  constructor(
      private readonly elementLocator_: UnresolvedWatchableLocator<Element>,
      private readonly attrName_: string,
      private readonly parser_: Converter<T, string>,
      private readonly type_: Type<T>,
      private readonly shouldDelete_: ShouldDelete<T>,
  ) {
    super();
  }

  resolve(resolver: <S>(path: string, type: Type<S>) => S):
      ResolvedAttributeOutLocator<T> {
    return new ResolvedAttributeOutLocator(
        this.elementLocator_.resolve(resolver),
        this.attrName_,
        this.parser_,
        this.type_,
        this.shouldDelete_,
    );
  }

  toString(): string {
    return `UnresolvedAttributeLocator(${this.elementLocator_}[${this.attrName_}])`;
  }
}

type AttributeLocator<T> = ResolvedAttributeOutLocator<T> | UnresolvedAttributeOutLocator<T>;

/**
 * Creates selector that selects an element.
 */
export function attributeOut<T>(
    elementLocator: UnresolvedWatchableLocator<Element>,
    attrName: string,
    converter: Converter<T, string>,
    type: Type<T>,
    shouldDelete?: ShouldDelete<T>,
): UnresolvedAttributeOutLocator<T>;
export function attributeOut<T>(
    elementLocator: ResolvedWatchableLocator<Element>,
    attrName: string,
    converter: Converter<T, string>,
    type: Type<T>,
    shouldDelete?: ShouldDelete<T>,
): ResolvedAttributeOutLocator<T>;
export function attributeOut<T>(
    elementLocator: ResolvedWatchableLocator<Element>|UnresolvedWatchableLocator<Element>,
    attrName: string,
    converter: Converter<T, string>,
    type: Type<T>,
    shouldDelete: ShouldDelete<T> = () => false,
): AttributeLocator<T> {
  if (elementLocator instanceof ResolvedLocator) {
    return new ResolvedAttributeOutLocator(
        elementLocator,
        attrName,
        converter,
        type,
        shouldDelete,
    );
  } else {
    return new UnresolvedAttributeOutLocator(
        elementLocator,
        attrName,
        converter,
        type,
        shouldDelete,
    );
  }
}
