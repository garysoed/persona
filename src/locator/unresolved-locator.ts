import { Type } from 'gs-types/export';
import { ResolvedLocator, ResolvedRenderableLocator, ResolvedRenderableWatchableLocator, ResolvedWatchableLocator } from './resolved-locator';


type LocatorPathResolver = <S>(path: string, type: Type<S>) => S;

/**
 * Locator spec that may refer to another resolved spec.
 */
export abstract class UnresolvedLocator<T> {
  abstract resolve(resolver: LocatorPathResolver): ResolvedLocator<T>;
}

/**
 * Locator spec that may refer to another resolved spec.
 */
export abstract class UnresolvedRenderableLocator<T> extends UnresolvedLocator<T> {
  abstract resolve(resolver: LocatorPathResolver): ResolvedRenderableLocator<T>;
}

/**
 * Locator spec that may refer to another resolved spec.
 */
export abstract class UnresolvedWatchableLocator<T> extends UnresolvedLocator<T> {
  abstract resolve(resolver: LocatorPathResolver): ResolvedWatchableLocator<T>;
}

/**
 * Locator spec that may refer to another resolved spec.
 */
export abstract class UnresolvedRenderableWatchableLocator<T> extends UnresolvedLocator<T> {
  abstract resolve(resolver: LocatorPathResolver): ResolvedRenderableWatchableLocator<T>;
}
