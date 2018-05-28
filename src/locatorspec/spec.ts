import { InstanceSourceId } from 'grapevine/export/component';
import { Type } from 'gs-types/export';

type SpecPathResolver = <S>(path: string, type: Type<S>) => S;

/**
 * Locator spec that has been resolved.
 */
export abstract class ResolvedSpec<T> {
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
export abstract class UnresolvedSpec<T> {
  abstract resolve(resolver: SpecPathResolver): ResolvedSpec<T>;
}
