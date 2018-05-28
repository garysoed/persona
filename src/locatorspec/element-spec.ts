import { InstanceSourceId, instanceSourceId } from 'grapevine/export/component';
import { InstanceofType, Type } from 'gs-types/export';
import { ResolvedSpec, UnresolvedSpec } from './spec';

export class ResolvedElementSpec<T extends HTMLElement> extends ResolvedSpec<T> {
  constructor(
      private readonly selectorString_: string,
      private readonly type_: Type<T>,
      sourceId_: InstanceSourceId<T>) {
    super(sourceId_);
  }

  toString(): string {
    return `ResolvedElementSpec(${this.sourceId_})`;
  }
}

export class UnresolvedElementSpec<T extends HTMLElement> extends UnresolvedSpec<T> {
  constructor(private readonly path_: string) {
    super();
  }

  resolve(resolver: <S>(path: string, type: Type<S>) => S): ResolvedElementSpec<T> {
    return resolver(this.path_, InstanceofType<ResolvedElementSpec<T>>(ResolvedElementSpec));
  }

  toString(): string {
    return `UnresolvedElementSpec(${this.path_})`;
  }
}

type ElementSpec<T extends HTMLElement> = ResolvedElementSpec<T> | UnresolvedElementSpec<T>;

export function elementSelector<T extends HTMLElement>(selector: string): UnresolvedElementSpec<T>;
export function elementSelector<T extends HTMLElement>(id: string, type: Type<T>):
    ResolvedElementSpec<T>;
export function elementSelector<T extends HTMLElement>(
    selectorOrId: string, type?: Type<T>): ElementSpec<T> {
  if (type) {
    return new ResolvedElementSpec(selectorOrId, type, instanceSourceId(selectorOrId, type));
  } else {
    return new UnresolvedElementSpec(selectorOrId);
  }
}
