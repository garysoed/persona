import { InstanceSourceId, InstanceStreamId } from 'grapevine/export/component';
import { VineImpl } from 'grapevine/export/main';
import { Type } from 'gs-types/export';
import { Watcher } from '../watcher/watcher';

type LocatorPathResolver = <S>(path: string, type: Type<S>) => S;

/**
 * Locator spec that has been resolved.
 */
export abstract class ResolvedLocator<T> {
  constructor(
      protected readonly sourceId_: InstanceSourceId<T>,
      protected readonly type_: Type<T>) { }

  abstract createWatcher(vine: VineImpl): Watcher<any>;

  getSourceId(): InstanceSourceId<T> {
    return this.sourceId_;
  }

  getType(): Type<T> {
    return this.type_;
  }
}

/**
 * Locator spec that may refer to another resolved spec.
 */
export abstract class UnresolvedLocator<T> {
  abstract resolve(resolver: LocatorPathResolver): ResolvedLocator<T>;
}

/**
 * Locator spec that has been resolved and can be used for rendering values into the DOM.
 */
export abstract class ResolvedRenderableLocator<T> extends ResolvedLocator<T> {
  constructor(
      protected readonly streamId_: InstanceStreamId<T>,
      sourceId: InstanceSourceId<T>,
      type: Type<T>) {
    super(sourceId, type);
  }

  getStreamId(): InstanceStreamId<T> {
    return this.streamId_;
  }

  abstract setValue(newValue: T): void;
}
