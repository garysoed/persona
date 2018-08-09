import { instanceStreamId } from 'grapevine/export/component';
import { VineImpl } from 'grapevine/export/main';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { StringType } from 'gs-types/export';
import { ResolvedLocator, ResolvedRenderableLocator, ResolvedWatchableLocator } from './resolved-locator';
import { LocatorPathResolver, UnresolvedRenderableLocator, UnresolvedWatchableLocator } from './unresolved-locator';

export class UnresolvedTextContentLocator<E extends HTMLElement|null>
    extends UnresolvedRenderableLocator<string> {
  constructor(private readonly elementLocator_: UnresolvedWatchableLocator<E>) {
    super();
  }

  resolve(resolver: LocatorPathResolver): ResolvedRenderableLocator<string> {
    return new ResolvedTextContentLocator(this.elementLocator_.resolve(resolver));
  }
}

export class ResolvedTextContentLocator<E extends HTMLElement|null>
    extends ResolvedRenderableLocator<string> {
  constructor(
      private readonly elementLocator_: ResolvedWatchableLocator<E>) {
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

export type TextContentLocator<E extends HTMLElement|null> =
    ResolvedTextContentLocator<E>|UnresolvedTextContentLocator<E>;

/**
 * Creates selector that selects an inner text of an element.
 */
export function textContent<E extends HTMLElement|null>(
    elementLocator: ResolvedWatchableLocator<E>): ResolvedTextContentLocator<E>;
export function textContent<E extends HTMLElement|null>(
    elementLocator: UnresolvedWatchableLocator<E>): UnresolvedTextContentLocator<E>;
export function textContent<E extends HTMLElement|null>(
    elementLocator: ResolvedWatchableLocator<E>|UnresolvedWatchableLocator<E>):
    TextContentLocator<E> {
  if (elementLocator instanceof ResolvedLocator) {
    return new ResolvedTextContentLocator(elementLocator);
  } else {
    return new UnresolvedTextContentLocator(elementLocator);
  }
}
