import { InstanceSourceId, InstanceStreamId } from 'grapevine/export/component';
import { VineImpl } from 'grapevine/export/main';
import { ImmutableSet } from 'gs-tools/export/collect';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { Type } from 'gs-types/export';
import { Observable, Subscription } from 'rxjs';

export type ResolvedWatchableLocators =
    ResolvedWatchableLocator<any>|ResolvedRenderableWatchableLocator<any>;

/**
 * Locator spec that has been resolved.
 */
export abstract class ResolvedLocator {
  readonly type: 'resolvedLocator' = 'resolvedLocator';

  abstract getDependencies(): ImmutableSet<ResolvedWatchableLocators>;
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

  abstract getObservableValue(root: ShadowRoot): Observable<T>;

  getReadingId(): InstanceSourceId<T> {
    return this.readingId_;
  }

  getType(): Type<T> {
    return this.readingId_.getType();
  }

  abstract getValue(root: ShadowRoot): T;

  startWatch(vine: VineImpl, context: BaseDisposable, root: ShadowRoot): Subscription {
    return this.getObservableValue(root)
        .subscribe(value => {
          vine.setValue(this.readingId_, value, context);
        });
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

  abstract getObservableValue(root: ShadowRoot): Observable<T>;

  getReadingId(): InstanceSourceId<T> {
    return this.sourceId_;
  }

  getType(): Type<T> {
    return this.sourceId_.getType();
  }

  abstract getValue(root: ShadowRoot): T;

  startWatch(vine: VineImpl, context: BaseDisposable, root: ShadowRoot): Subscription {
    return this.getObservableValue(root)
        .subscribe(value => {
          vine.setValue(this.sourceId_, value, context);
        });
  }
}
