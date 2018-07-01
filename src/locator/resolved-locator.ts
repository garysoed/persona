import { InstanceSourceId, InstanceStreamId } from 'grapevine/export/component';
import { VineBuilder, VineImpl } from 'grapevine/export/main';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { Type } from 'gs-types/export';
import { Watcher } from '../watcher/watcher';

/**
 * Locator spec that has been resolved.
 */
export abstract class ResolvedLocator { }

/**
 * Locator spec that has been resolved and can be used for rendering values into the DOM.
 */
export abstract class ResolvedRenderableLocator<T> extends ResolvedLocator {
  constructor(private readonly streamId_: InstanceStreamId<T>) {
    super();
  }

  getWritingId(): InstanceStreamId<T> {
    return this.streamId_;
  }

  abstract startRender(vine: VineImpl, context: BaseDisposable): () => void;
}

/**
 * Locator spec that has been resolved and has a watcher.
 */
export abstract class ResolvedWatchableLocator<T> extends ResolvedLocator {
  constructor(private readonly sourceId_: InstanceSourceId<T>) {
    super();
  }

  abstract createWatcher(vine: VineImpl): Watcher<T>;

  getReadingId(): InstanceSourceId<T> {
    return this.sourceId_;
  }

  getType(): Type<T> {
    return this.sourceId_.getType();
  }

  abstract getValue(root: ShadowRoot): T;
}

/**
 * Locator spec that has been resolved and can be used for rendering values into the DOM, and has
 * a watcher.
 */
export abstract class ResolvedRenderableWatchableLocator<T> extends ResolvedRenderableLocator<T> {
  constructor(
      streamId_: InstanceStreamId<T>,
      private readonly sourceId_: InstanceSourceId<T>) {
    super(streamId_);
  }

  abstract createWatcher(vine: VineImpl): Watcher<T>;

  getReadingId(): InstanceSourceId<T> {
    return this.sourceId_;
  }

  getType(): Type<T> {
    return this.sourceId_.getType();
  }

  abstract getValue(root: ShadowRoot): T;
}
