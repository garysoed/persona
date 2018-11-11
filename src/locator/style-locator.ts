import { instanceStreamId } from 'grapevine/export/component';
import { VineImpl } from 'grapevine/export/main';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { AnyType, Type } from 'gs-types/export';
import { combineLatest, Subscription } from 'rxjs';
import { ResolvedRenderableLocator, ResolvedWatchableLocator } from './resolved-locator';
import { UnresolvedRenderableLocator, UnresolvedWatchableLocator } from './unresolved-locator';

/**
 * @internal
 */
export class ResolvedStyleLocator<S extends keyof CSSStyleDeclaration>
    extends ResolvedRenderableLocator<CSSStyleDeclaration[S]|null> {
  constructor(
      readonly elementLocator: ResolvedWatchableLocator<HTMLElement|null>,
      readonly styleKey: S) {
    super(instanceStreamId(`${elementLocator}.${styleKey}`, AnyType()));
  }

  startRender(vine: VineImpl, context: BaseDisposable): Subscription {
    return combineLatest(
        vine.getObservable(this.elementLocator.getReadingId(), context),
        vine.getObservable(this.getWritingId(), context),
        )
        .subscribe(([el, value]) => {
          if (!el) {
            return;
          }

          el.style[this.styleKey] = value;
        });
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
