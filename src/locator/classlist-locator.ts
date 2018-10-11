import { ImmutableSet } from 'gs-tools/export/collect';
import { Parser } from 'gs-tools/export/parse';
import { InstanceofType, Type } from 'gs-types/export';
import { ResolvedAttributeLocator } from './attribute-locator';
import { ResolvedWatchableLocator } from './resolved-locator';
import { UnresolvedRenderableLocator, UnresolvedWatchableLocator } from './unresolved-locator';

export const classListParser: Parser<ImmutableSet<string>> = {
  convertFrom(input: string|null): ImmutableSet<string> {
    if (!input) {
      return ImmutableSet.of();
    }

    return ImmutableSet.of(input.split(' '));
  },

  convertTo(classes: ImmutableSet<string>): string {
    return [...classes].join(' ');
  },
};

/**
 * @internal
 */
export class ResolvedClassListLocator
    extends ResolvedAttributeLocator<ImmutableSet<string>> {
  constructor(elementLocator: ResolvedWatchableLocator<HTMLElement|null>) {
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
export class UnresolvedClassListLocator
    extends UnresolvedRenderableLocator<ImmutableSet<string>> {
  constructor(
      private readonly elementLocator_: UnresolvedWatchableLocator<HTMLElement|null>) {
    super();
  }

  resolve(resolver: <K>(path: string, type: Type<K>) => K): ResolvedClassListLocator {
    return new ResolvedClassListLocator(this.elementLocator_.resolve(resolver));
  }
}

export type ClassListLocator = ResolvedClassListLocator|UnresolvedClassListLocator;

/**
 * Creates selector that selects the given style of an element.
 */
export function classlist(
    elementLocator: UnresolvedWatchableLocator<HTMLElement|null>): UnresolvedClassListLocator;
export function classlist<E extends HTMLElement|null>(
    elementLocator: ResolvedWatchableLocator<HTMLElement|null>): ResolvedClassListLocator;
export function classlist<E extends HTMLElement|null>(
    elementLocator:
        UnresolvedWatchableLocator<HTMLElement|null>|ResolvedWatchableLocator<HTMLElement|null>):
    ClassListLocator {
  if (elementLocator instanceof ResolvedWatchableLocator) {
    return new ResolvedClassListLocator(elementLocator);
  } else {
    return new UnresolvedClassListLocator(elementLocator);
  }
}
