import { InstanceSourceId, InstanceStreamId } from 'grapevine/export/component';
import { VineBuilder, VineImpl } from 'grapevine/export/main';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { Type } from 'gs-types/export';
import { Watcher } from '../watcher/watcher';

type LocatorPathResolver = <S>(path: string, type: Type<S>) => S;

/**
 * Locator spec that has been resolved.
 */
export abstract class ResolvedLocator<T> {
  constructor(
      protected readonly sourceId_: InstanceSourceId<T>) { }

  abstract createWatcher(vine: VineImpl): Watcher<T>;

  getSourceId(): InstanceSourceId<T> {
    return this.sourceId_;
  }

  getType(): Type<T> {
    return this.sourceId_.getType();
  }

  abstract getValue(root: ShadowRoot): T;
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
      sourceId: InstanceSourceId<T>) {
    super(sourceId);
  }

  getStreamId(): InstanceStreamId<T> {
    return this.streamId_;
  }

  abstract setupVine(builder: VineBuilder): void;

  abstract startRender(vine: VineImpl, context: BaseDisposable): () => void;
}
