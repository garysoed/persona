import { instanceSourceId } from 'grapevine/export/component';
import { cache } from 'gs-tools/export/data';
import { DisposableFunction } from 'gs-tools/export/dispose';
import { InstanceofType, Type } from 'gs-types/export';
import { ChainedWatcher, Unlisten } from '../watcher/chained-watcher';
import { Handler, Watcher } from '../watcher/watcher';
import { ResolvedWatchableLocator } from './resolved-locator';
import { UnresolvedWatchableLocator } from './unresolved-locator';

type DispatchFn<E extends CustomEvent> = (event: E) => void;

function createDispatcher<E extends CustomEvent>(element: HTMLElement): DispatchFn<E> {
  return event => element.dispatchEvent(event);
}

export function startWatch_<E extends CustomEvent>(
    root: ShadowRoot,
    element: HTMLElement|null,
    prevUnlisten: Unlisten|null,
    onChange: Handler): Unlisten|null {
  // If already bound, bail out.
  if (prevUnlisten && prevUnlisten.key === element) {
    return prevUnlisten;
  }

  if (prevUnlisten) {
    prevUnlisten.unlisten.dispose();
  }

  if (!element) {
    onChange(root);

    return null;
  }

  onChange(root);

  return {key: element, unlisten: DisposableFunction.of(() => undefined)};
}

/**
 * @internal
 */
export class ResolvedDispatcherLocator<V extends CustomEvent>
    extends ResolvedWatchableLocator<DispatchFn<V>|null> {
  constructor(
      private readonly elementLocator_: ResolvedWatchableLocator<HTMLElement|null>) {
    super(instanceSourceId(`${elementLocator_}.dispatch`, InstanceofType<DispatchFn<V>>(Function)));
  }

  @cache()
  createWatcher(): Watcher<DispatchFn<V>|null> {
    return new ChainedWatcher<HTMLElement|null, DispatchFn<V>|null>(
        this.elementLocator_.createWatcher(),
        (
            element,
            prevUnlisten,
            _,
            onChange,
            root) => startWatch_(root, element, prevUnlisten, onChange),
        source => {
          if (!source) {
            return null;
          }

          return createDispatcher(source);
        });
  }

  getValue(root: ShadowRoot): DispatchFn<V>|null {
    const element = this.elementLocator_.getValue(root);
    if (!element) {
      return null;
    }

    return createDispatcher(element);
  }
}

/**
 * @internal
 */
export class UnresolvedDispatcherLocator<V extends CustomEvent> extends
    UnresolvedWatchableLocator<DispatchFn<V>|null> {
  constructor(
      private readonly elementLocator_: UnresolvedWatchableLocator<HTMLElement|null>) {
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
    elementLocator: UnresolvedWatchableLocator<HTMLElement|null>): UnresolvedDispatcherLocator<V>;
export function dispatcher<V extends CustomEvent>(
    elementLocator: ResolvedWatchableLocator<HTMLElement|null>): ResolvedDispatcherLocator<V>;
export function dispatcher<V extends CustomEvent>(
    elementLocator:
        UnresolvedWatchableLocator<HTMLElement|null>| ResolvedWatchableLocator<HTMLElement|null>):
        DispatcherLocator<V> {
  if (elementLocator instanceof ResolvedWatchableLocator) {
    return new ResolvedDispatcherLocator(elementLocator);
  } else {
    return new UnresolvedDispatcherLocator(elementLocator);
  }
}
