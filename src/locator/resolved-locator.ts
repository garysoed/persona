import { InstanceSourceId, InstanceStreamId } from 'grapevine/export/component';
import { VineImpl } from 'grapevine/export/main';
import { BaseDisposable, DisposableFunction } from 'gs-tools/export/dispose';
import { Type } from 'gs-types/export';
import { Subscription } from 'rxjs';
import { Watcher } from '../watcher/watcher';

/**
 * Locator spec that has been resolved.
 */
export abstract class ResolvedLocator {
  readonly type: 'resolvedLocator' = 'resolvedLocator';
}

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

  abstract startRender(vine: VineImpl, context: BaseDisposable): Subscription;
}

/**
 * Locator spec that has been resolved and has a watcher.
 */
export abstract class ResolvedWatchableLocator<T> extends ResolvedLocator {
  constructor(private readonly readingId_: InstanceSourceId<T>) {
    super();
  }

  abstract createWatcher(): Watcher<T>;

  getReadingId(): InstanceSourceId<T> {
    return this.readingId_;
  }

  getType(): Type<T> {
    return this.readingId_.getType();
  }

  abstract getValue(root: ShadowRoot): T;

  startWatch(vine: VineImpl, context: BaseDisposable, root: ShadowRoot): DisposableFunction {
    const watcher = this.createWatcher();

    return watcher
        .watch(
            vine,
            root => {
              vine.setValue(
                  this.readingId_,
                  watcher.getValue(root),
                  context);
            },
            root);
  }
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

  abstract createWatcher(): Watcher<T>;

  getReadingId(): InstanceSourceId<T> {
    return this.sourceId_;
  }

  getType(): Type<T> {
    return this.sourceId_.getType();
  }

  abstract getValue(root: ShadowRoot): T;

  startWatch(vine: VineImpl, context: BaseDisposable, root: ShadowRoot): DisposableFunction {
    const watcher = this.createWatcher();

    return watcher.watch(vine, root => {
      vine.setValue(this.sourceId_, watcher.getValue(root), context);
    },                   root);
  }
}
