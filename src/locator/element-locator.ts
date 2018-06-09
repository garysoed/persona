import { InstanceSourceId, instanceSourceId } from 'grapevine/export/component';
import { VineImpl } from 'grapevine/export/main';
import { InstanceofType, Type } from 'gs-types/export';
import { ElementWatcher } from '../watcher/element-watcher';
import { ResolvedLocator, UnresolvedLocator } from './locator';

/**
 * @internal
 */
export class ResolvedElementLocator<T extends HTMLElement | null> extends ResolvedLocator<T> {
  constructor(
      private readonly selectorString_: string,
      sourceId: InstanceSourceId<T>) {
    super(sourceId);
  }

  createWatcher(vine: VineImpl): ElementWatcher<T> {
    return new ElementWatcher(this.selectorString_, this.getType(), this.sourceId_, vine);
  }

  getSelectorString(): string {
    return this.selectorString_;
  }

  toString(): string {
    return `ResolvedAttributeLocator(${this.sourceId_})`;
  }
}

/**
 * @internal
 */
export class UnresolvedElementLocator<T extends HTMLElement | null> extends UnresolvedLocator<T> {
  constructor(private readonly path_: string) {
    super();
  }

  getPath(): string {
    return this.path_;
  }

  resolve(resolver: <S>(path: string, type: Type<S>) => S): ResolvedElementLocator<T> {
    return resolver(this.path_, InstanceofType<ResolvedElementLocator<T>>(ResolvedElementLocator));
  }

  toString(): string {
    return `UnresolvedAttributeLocator(${this.path_})`;
  }
}

export type ElementLocator<T extends HTMLElement | null> =
    ResolvedElementLocator<T> | UnresolvedElementLocator<T>;

/**
 * Creates selector that selects an element.
 */
export function element<T extends HTMLElement | null>(
    selector: string): UnresolvedElementLocator<T>;
export function element<T extends HTMLElement | null>(cssSelector: string, type: Type<T>):
    ResolvedElementLocator<T>;
export function element<T extends HTMLElement | null>(
    selector: string, type?: Type<T>): ElementLocator<T> {
  if (type) {
    return new ResolvedElementLocator(selector, instanceSourceId(selector, type));
  } else {
    return new UnresolvedElementLocator(selector);
  }
}
