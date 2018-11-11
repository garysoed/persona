import { ImmutableSet } from 'gs-tools/export/collect';
import { Converter } from 'gs-tools/src/converter/converter';
import { InstanceofType, Type } from 'gs-types/export';
import { ResolvedAttributeLocator } from './attribute-locator';
import { ResolvedWatchableLocator } from './resolved-locator';
import { UnresolvedRenderableLocator, UnresolvedWatchableLocator } from './unresolved-locator';

export const classListParser: Converter<ImmutableSet<string>, string> = {
  convertBackward(input: string|null): ImmutableSet<string> {
    if (!input) {
      return ImmutableSet.of();
    }

    return ImmutableSet.of(input.split(' '));
  },

  convertForward(classes: ImmutableSet<string>): string {
    return [...classes].join(' ');
  },
};

/**
 * @internal
 */
export class ResolvedClassListLocator
    extends ResolvedAttributeLocator<ImmutableSet<string>> {
  constructor(elementLocator: ResolvedWatchableLocator<Element>) {
    super(
        elementLocator,
        'class',
        classListParser,
        InstanceofType<ImmutableSet<string>>(ImmutableSet),
        ImmutableSet.of(),
    );
  }
}

/**
 * @internal
 */
export class UnresolvedClassListLocator
    extends UnresolvedRenderableLocator<ImmutableSet<string>> {
  constructor(
      private readonly elementLocator_: UnresolvedWatchableLocator<Element>) {
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
    elementLocator: UnresolvedWatchableLocator<Element>): UnresolvedClassListLocator;
export function classlist(
    elementLocator: ResolvedWatchableLocator<Element>): ResolvedClassListLocator;
export function classlist(
    elementLocator: UnresolvedWatchableLocator<Element>|ResolvedWatchableLocator<Element>):
    ClassListLocator {
  if (elementLocator instanceof ResolvedWatchableLocator) {
    return new ResolvedClassListLocator(elementLocator);
  } else {
    return new UnresolvedClassListLocator(elementLocator);
  }
}
