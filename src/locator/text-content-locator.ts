import { instanceStreamId } from 'grapevine/export/component';
import { VineImpl } from 'grapevine/export/main';
import { ImmutableSet } from 'gs-tools/export/collect';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { StringType } from 'gs-types/export';
import { combineLatest, Subscription } from 'rxjs';
import { ResolvedLocator, ResolvedRenderableLocator, ResolvedWatchableLocator } from './resolved-locator';
import { LocatorPathResolver, UnresolvedRenderableLocator, UnresolvedWatchableLocator } from './unresolved-locator';

/**
 * @internal
 */
export class ResolvedTextContentLocator
    extends ResolvedRenderableLocator<string> {
  constructor(
      readonly elementLocator: ResolvedWatchableLocator<Element>) {
    super(instanceStreamId(`${elementLocator}.innerText`, StringType));
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
        .subscribe(([el, renderedTextContent]) => {
          if (!el) {
            return;
          }

          el.textContent = renderedTextContent;
        });
  }
}

/**
 * @internal
 */
export class UnresolvedTextContentLocator
    extends UnresolvedRenderableLocator<string> {
  constructor(private readonly elementLocator_: UnresolvedWatchableLocator<Element>) {
    super();
  }

  resolve(resolver: LocatorPathResolver): ResolvedRenderableLocator<string> {
    return new ResolvedTextContentLocator(this.elementLocator_.resolve(resolver));
  }
}

export type TextContentLocator = ResolvedTextContentLocator|UnresolvedTextContentLocator;

/**
 * Creates selector that selects a text content of an element.
 */
export function textContent(
    elementLocator: ResolvedWatchableLocator<Element>): ResolvedTextContentLocator;
export function textContent(
    elementLocator: UnresolvedWatchableLocator<Element>): UnresolvedTextContentLocator;
export function textContent(
    elementLocator:
        ResolvedWatchableLocator<Element>|UnresolvedWatchableLocator<Element>):
    TextContentLocator {
  if (elementLocator instanceof ResolvedLocator) {
    return new ResolvedTextContentLocator(elementLocator);
  } else {
    return new UnresolvedTextContentLocator(elementLocator);
  }
}
