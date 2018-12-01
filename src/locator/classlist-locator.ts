import { ImmutableSet } from 'gs-tools/export/collect';
import { InstanceofType, Type } from 'gs-types/export';
import { Converter, Result } from 'nabu/export/main';
import { ResolvedAttributeLocator } from './attribute-locator';
import { ResolvedWatchableLocator } from './resolved-locator';
import { UnresolvedRenderableLocator, UnresolvedWatchableLocator } from './unresolved-locator';

export const classListParser: Converter<ImmutableSet<string>, string> = {
  convertBackward(input: string): Result<ImmutableSet<string>> {
    return {result: ImmutableSet.of(input.split(' ')), success: true};
  },

  convertForward(classes: ImmutableSet<string>): Result<string> {
    return {result: [...classes].join(' '), success: true};
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
