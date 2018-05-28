import { InstanceSourceId } from 'grapevine/export/component';
import { Type } from 'gs-types/export';

export type SpecPathResolver = <S>(path: string, type: Type<S>) => S;

export abstract class ResolvedSpec<T> {
  constructor(protected readonly sourceId_: InstanceSourceId<T>) { }

  getSourceId(): InstanceSourceId<T> {
    return this.sourceId_;
  }
}

export abstract class UnresolvedSpec<T> {
  abstract resolve(resolver: SpecPathResolver): ResolvedSpec<T>;
}
