import { instanceStreamId } from 'grapevine/export/component';
import { VineImpl } from 'grapevine/export/main';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { AnyType, Type } from 'gs-types/export';
import { ResolvedRenderableLocator, ResolvedWatchableLocator } from './resolved-locator';
import { UnresolvedRenderableLocator, UnresolvedWatchableLocator } from './unresolved-locator';

/**
 * @internal
 */
export class ResolvedStyleLocator<S extends keyof CSSStyleDeclaration, E extends HTMLElement|null>
    extends ResolvedRenderableLocator<CSSStyleDeclaration[S]|null> {
  constructor(
      private readonly elementLocator_: ResolvedWatchableLocator<E>,
      private readonly styleKey_: S) {
    super(instanceStreamId(`${elementLocator_}.${styleKey_}`, AnyType()));
  }

  startRender(vine: VineImpl, context: BaseDisposable): () => void {
    return vine.listen((el, value) => {
      if (!el) {
        return;
      }

      el.style[this.styleKey_] = value;
    }, context, this.elementLocator_.getReadingId(), this.getWritingId());
  }
}

/**
 * @internal
 */
export class UnresolvedStyleLocator<S extends keyof CSSStyleDeclaration, E extends HTMLElement|null>
    extends UnresolvedRenderableLocator<CSSStyleDeclaration[S]|null> {
  constructor(
      private readonly elementLocator_: UnresolvedWatchableLocator<E>,
      private readonly styleKey_: S) {
    super();
  }

  resolve(resolver: <K>(path: string, type: Type<K>) => K): ResolvedStyleLocator<S, E> {
    return new ResolvedStyleLocator(this.elementLocator_.resolve(resolver), this.styleKey_);
  }
}

export type StyleLocator<S extends keyof CSSStyleDeclaration, E extends HTMLElement|null> =
    ResolvedStyleLocator<S, E>|UnresolvedStyleLocator<S, E>;

/**
 * Creates selector that selects the given style of an element.
 */
export function style<E extends HTMLElement|null, S extends keyof CSSStyleDeclaration>(
    elementLocator: UnresolvedWatchableLocator<E>,
    styleKey: S): UnresolvedStyleLocator<S, E>;
export function style<E extends HTMLElement|null, S extends keyof CSSStyleDeclaration>(
    elementLocator: ResolvedWatchableLocator<E>,
    styleKey: S): ResolvedStyleLocator<S, E>;
export function style<E extends HTMLElement|null, S extends keyof CSSStyleDeclaration>(
    elementLocator: UnresolvedWatchableLocator<E>|ResolvedWatchableLocator<E>,
    styleKey: S): StyleLocator<S, E> {
  if (elementLocator instanceof ResolvedWatchableLocator) {
    return new ResolvedStyleLocator(elementLocator, styleKey);
  } else {
    return new UnresolvedStyleLocator(elementLocator, styleKey);
  }
}
