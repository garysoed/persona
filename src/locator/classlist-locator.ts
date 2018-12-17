import { instanceStreamId } from 'grapevine/export/component';
import { VineImpl } from 'grapevine/export/main';
import { ImmutableSet } from 'gs-tools/export/collect';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { diff } from 'gs-tools/export/util';
import { InstanceofType, Type } from 'gs-types/export';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResolvedRenderableLocator, ResolvedWatchableLocator } from './resolved-locator';
import { UnresolvedRenderableLocator, UnresolvedWatchableLocator } from './unresolved-locator';

const __classes = Symbol('classes');
interface ElementWithClasses extends Element {
  [__classes]?: ImmutableSet<string>;
}

/**
 * @internal
 */
export class ResolvedClassListLocator extends ResolvedRenderableLocator<ImmutableSet<string>> {
  constructor(readonly elementLocator: ResolvedWatchableLocator<Element>) {
    super(
        instanceStreamId(
            `${elementLocator}.classList`,
            InstanceofType<ImmutableSet<string>>(ImmutableSet)));
  }

  getDependencies(): ImmutableSet<ResolvedWatchableLocator<any>> {
    return ImmutableSet
        .of<ResolvedWatchableLocator<any>>([this.elementLocator])
        .addAll(this.elementLocator.getDependencies());
  }

  startRender(vine: VineImpl, context: BaseDisposable): Subscription {
    const elementObs = vine.getObservable(
        this.elementLocator.getReadingId(),
        context,
    ) as Observable<ElementWithClasses>;

    return combineLatest(
            elementObs,
            vine.getObservable(this.getWritingId(), context),
        )
        .subscribe(([element, classes]) => {
          const existingClasses = element[__classes] || ImmutableSet.of();
          const {added, deleted} = diff(existingClasses, classes);

          for (const item of added) {
            element.classList.add(item);
          }

          for (const item of deleted) {
            element.classList.remove(item);
          }

          element[__classes] = classes;
        });
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
