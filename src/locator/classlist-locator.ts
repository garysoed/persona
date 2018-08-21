import { ImmutableSet } from 'gs-tools/export/collect';
import { Parser } from 'gs-tools/export/parse';
import { InstanceofType, Type } from 'gs-types/export';
import { ResolvedAttributeLocator } from './attribute-locator';
import { ResolvedWatchableLocator } from './resolved-locator';
import { UnresolvedRenderableLocator, UnresolvedWatchableLocator } from './unresolved-locator';

export const classListParser: Parser<ImmutableSet<string>> = {
  parse(input: string|null): ImmutableSet<string> {
    if (!input) {
      return ImmutableSet.of();
    }

    return ImmutableSet.of(input.split(' '));
  },

  stringify(classes: ImmutableSet<string>): string {
    return [...classes].join(' ');
  },
};

/**
 * @internal
 */
export class ResolvedClassListLocator<E extends HTMLElement|null>
    extends ResolvedAttributeLocator<ImmutableSet<string>, E> {
  constructor(elementLocator: ResolvedWatchableLocator<E>) {
    super(
        elementLocator,
        'class',
        ImmutableSet.of(),
        classListParser,
        InstanceofType<ImmutableSet<string>>(ImmutableSet));
  }
}

/**
 * @internal
 */
export class UnresolvedClassListLocator<E extends HTMLElement|null>
    extends UnresolvedRenderableLocator<ImmutableSet<string>> {
  constructor(
      private readonly elementLocator_: UnresolvedWatchableLocator<E>) {
    super();
  }

  resolve(resolver: <K>(path: string, type: Type<K>) => K): ResolvedClassListLocator<E> {
    return new ResolvedClassListLocator(this.elementLocator_.resolve(resolver));
  }
}

export type ClassListLocator<E extends HTMLElement|null> =
    ResolvedClassListLocator<E>|UnresolvedClassListLocator<E>;

/**
 * Creates selector that selects the given style of an element.
 */
export function classlist<E extends HTMLElement|null>(
    elementLocator: UnresolvedWatchableLocator<E>): UnresolvedClassListLocator<E>;
export function classlist<E extends HTMLElement|null>(
    elementLocator: ResolvedWatchableLocator<E>): ResolvedClassListLocator<E>;
export function classlist<E extends HTMLElement|null>(
    elementLocator: UnresolvedWatchableLocator<E>|ResolvedWatchableLocator<E>):
    ClassListLocator<E> {
  if (elementLocator instanceof ResolvedWatchableLocator) {
    return new ResolvedClassListLocator(elementLocator);
  } else {
    return new UnresolvedClassListLocator(elementLocator);
  }
}
