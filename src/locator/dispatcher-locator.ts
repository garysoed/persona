import { instanceSourceId } from 'grapevine/export/component';
import { cache } from 'gs-tools/export/data';
import { InstanceofType, Type } from 'gs-types/export';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResolvedWatchableLocator } from './resolved-locator';
import { UnresolvedWatchableLocator } from './unresolved-locator';

export type DispatchFn<E extends CustomEvent> = (event: E) => void;

/**
 * @internal
 */
export class ResolvedDispatcherLocator<E extends CustomEvent>
    extends ResolvedWatchableLocator<DispatchFn<E>|null> {
  constructor(
      private readonly elementLocator_: ResolvedWatchableLocator<HTMLElement>) {
    super(instanceSourceId(`${elementLocator_}.dispatch`, InstanceofType<DispatchFn<E>>(Function)));
  }

  @cache()
  getObservableValue(root: ShadowRoot): Observable<DispatchFn<E>> {
    return this.elementLocator_.getObservableValue(root)
        .pipe(map(el => (event: E) => el.dispatchEvent(event)));
  }

  getValue(root: ShadowRoot): DispatchFn<E>|null {
    const element = this.elementLocator_.getValue(root);

    return (event: E) => element.dispatchEvent(event);
  }
}

/**
 * @internal
 */
export class UnresolvedDispatcherLocator<V extends CustomEvent> extends
    UnresolvedWatchableLocator<DispatchFn<V>|null> {
  constructor(
      private readonly elementLocator_: UnresolvedWatchableLocator<HTMLElement>) {
    super();
  }

  resolve(resolver: <S>(path: string, type: Type<S>) => S): ResolvedDispatcherLocator<V> {
    return new ResolvedDispatcherLocator(this.elementLocator_.resolve(resolver));
  }
}

type DispatcherLocator<V extends CustomEvent> =
    ResolvedDispatcherLocator<V>|UnresolvedDispatcherLocator<V>;

/**
 * Creates selector that selects the event dispatch function of an element.
 */
export function dispatcher<V extends CustomEvent>(
    elementLocator: UnresolvedWatchableLocator<HTMLElement>): UnresolvedDispatcherLocator<V>;
export function dispatcher<V extends CustomEvent>(
    elementLocator: ResolvedWatchableLocator<HTMLElement>): ResolvedDispatcherLocator<V>;
export function dispatcher<V extends CustomEvent>(
    elementLocator:
        UnresolvedWatchableLocator<HTMLElement>| ResolvedWatchableLocator<HTMLElement>):
        DispatcherLocator<V> {
  if (elementLocator instanceof ResolvedWatchableLocator) {
    return new ResolvedDispatcherLocator(elementLocator);
  } else {
    return new UnresolvedDispatcherLocator(elementLocator);
  }
}
