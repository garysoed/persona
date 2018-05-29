import { InstanceSourceId, InstanceStreamId } from 'grapevine/export/component';
import { Type } from 'gs-types/export';

type LocatorPathResolver = <S>(path: string, type: Type<S>) => S;

/**
 * Locator spec that has been resolved.
 */
export abstract class ResolvedLocator<T> {
  constructor(
      protected readonly sourceId_: InstanceSourceId<T>,
      protected readonly type_: Type<T>) { }

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
