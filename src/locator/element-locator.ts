import { InstanceSourceId, instanceSourceId } from 'grapevine/export/component';
import { VineImpl } from 'grapevine/export/main';
import { InstanceofType, Type } from 'gs-types/export';
import { ElementWatcher } from '../watcher/element-watcher';
import { ResolvedLocator, UnresolvedLocator } from './locator';

/**
 * @internal
 */
export class ResolvedElementLocator<T extends HTMLElement> extends ResolvedLocator<T> {
  constructor(
      private readonly selectorString_: string,
      type: Type<T>,
      sourceId: InstanceSourceId<T>) {
    super(sourceId, type);
  }

  createWatcher(vine: VineImpl): ElementWatcher<T> {
    return new ElementWatcher(this, vine);
  }

  getSelectorString(): string {
    return this.selectorString_;
  }

  toString(): string {
    return `ResolvedElementSpec(${this.sourceId_})`;
  }
}

/**
 * @internal
 */
export class UnresolvedElementLocator<T extends HTMLElement> extends UnresolvedLocator<T> {
  constructor(private readonly path_: string) {
    super();
  }

  resolve(resolver: <S>(path: string, type: Type<S>) => S): ResolvedElementLocator<T> {
    return resolver(this.path_, InstanceofType<ResolvedElementLocator<T>>(ResolvedElementLocator));
  }

  toString(): string {
    return `UnresolvedElementSpec(${this.path_})`;
  }
}

type ElementSpec<T extends HTMLElement> = ResolvedElementLocator<T> | UnresolvedElementLocator<T>;

/**
 * Creates selector that selects an element.
 */
export function element<T extends HTMLElement>(selector: string): UnresolvedElementLocator<T>;
export function element<T extends HTMLElement>(id: string, type: Type<T>):
    ResolvedElementLocator<T>;
export function element<T extends HTMLElement>(
    selectorOrId: string, type?: Type<T>): ElementSpec<T> {
  if (type) {
    return new ResolvedElementLocator(selectorOrId, type, instanceSourceId(selectorOrId, type));
  } else {
    return new UnresolvedElementLocator(selectorOrId);
  }
}
