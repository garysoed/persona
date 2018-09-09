import { instanceStreamId } from 'grapevine/export/component';
import { VineImpl } from 'grapevine/export/main';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { StringType } from 'gs-types/export';
import { ResolvedLocator, ResolvedRenderableLocator, ResolvedWatchableLocator } from './resolved-locator';
import { LocatorPathResolver, UnresolvedRenderableLocator, UnresolvedWatchableLocator } from './unresolved-locator';

/**
 * @internal
 */
export class ResolvedTextContentLocator
    extends ResolvedRenderableLocator<string> {
  constructor(
      private readonly elementLocator_: ResolvedWatchableLocator<HTMLElement|null>) {
    super(instanceStreamId(`${elementLocator_}.innerText`, StringType));
  }

  startRender(vine: VineImpl, context: BaseDisposable): () => void {
    return vine.listen((el, renderedTextContent) => {
      if (!el) {
        return;
      }

      el.textContent = renderedTextContent;
    }, context, this.elementLocator_.getReadingId(), this.getWritingId());
  }
}

/**
 * @internal
 */
export class UnresolvedTextContentLocator
    extends UnresolvedRenderableLocator<string> {
  constructor(private readonly elementLocator_: UnresolvedWatchableLocator<HTMLElement|null>) {
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
    elementLocator: ResolvedWatchableLocator<HTMLElement|null>): ResolvedTextContentLocator;
export function textContent(
    elementLocator: UnresolvedWatchableLocator<HTMLElement|null>): UnresolvedTextContentLocator;
export function textContent(
    elementLocator:
        ResolvedWatchableLocator<HTMLElement|null>|UnresolvedWatchableLocator<HTMLElement|null>):
    TextContentLocator {
  if (elementLocator instanceof ResolvedLocator) {
    return new ResolvedTextContentLocator(elementLocator);
  } else {
    return new UnresolvedTextContentLocator(elementLocator);
  }
}
