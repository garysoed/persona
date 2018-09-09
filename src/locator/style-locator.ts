import { instanceStreamId } from 'grapevine/export/component';
import { VineImpl } from 'grapevine/export/main';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { AnyType, Type } from 'gs-types/export';
import { ResolvedRenderableLocator, ResolvedWatchableLocator } from './resolved-locator';
import { UnresolvedRenderableLocator, UnresolvedWatchableLocator } from './unresolved-locator';

/**
 * @internal
 */
export class ResolvedStyleLocator<S extends keyof CSSStyleDeclaration>
    extends ResolvedRenderableLocator<CSSStyleDeclaration[S]|null> {
  constructor(
      private readonly elementLocator_: ResolvedWatchableLocator<HTMLElement|null>,
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
export class UnresolvedStyleLocator<S extends keyof CSSStyleDeclaration>
    extends UnresolvedRenderableLocator<CSSStyleDeclaration[S]|null> {
  constructor(
      private readonly elementLocator_: UnresolvedWatchableLocator<HTMLElement|null>,
      private readonly styleKey_: S) {
    super();
  }

  resolve(resolver: <K>(path: string, type: Type<K>) => K): ResolvedStyleLocator<S> {
    return new ResolvedStyleLocator(this.elementLocator_.resolve(resolver), this.styleKey_);
  }
}

export type StyleLocator<S extends keyof CSSStyleDeclaration> =
    ResolvedStyleLocator<S>|UnresolvedStyleLocator<S>;

/**
 * Creates selector that selects the given style of an element.
 */
export function style<S extends keyof CSSStyleDeclaration>(
    elementLocator: UnresolvedWatchableLocator<HTMLElement|null>,
    styleKey: S): UnresolvedStyleLocator<S>;
export function style<S extends keyof CSSStyleDeclaration>(
    elementLocator: ResolvedWatchableLocator<HTMLElement|null>,
    styleKey: S): ResolvedStyleLocator<S>;
export function style<S extends keyof CSSStyleDeclaration>(
    elementLocator:
        UnresolvedWatchableLocator<HTMLElement|null>|ResolvedWatchableLocator<HTMLElement|null>,
    styleKey: S): StyleLocator<S> {
  if (elementLocator instanceof ResolvedWatchableLocator) {
    return new ResolvedStyleLocator(elementLocator, styleKey);
  } else {
    return new UnresolvedStyleLocator(elementLocator, styleKey);
  }
}
