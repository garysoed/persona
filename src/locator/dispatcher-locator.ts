import { instanceSourceId } from 'grapevine/export/component';
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
    element: HTMLElement|null,
    prevUnlisten: Unlisten|null,
    onChange: Handler<DispatchFn<E>|null>): Unlisten|null {
  // If already bound, bail out.
  if (prevUnlisten && prevUnlisten.key === element) {
    return prevUnlisten;
  }

  if (prevUnlisten) {
    prevUnlisten.unlisten.dispose();
  }

  if (!element) {
    onChange(null);

    return null;
  }

  onChange(createDispatcher(element));

  return {key: element, unlisten: DisposableFunction.of(() => undefined)};
}

/**
 * @internal
 */
export class ResolvedDispatcherLocator<V extends CustomEvent, E extends HTMLElement>
    extends ResolvedWatchableLocator<DispatchFn<V>|null> {
  constructor(
      private readonly elementLocator_: ResolvedWatchableLocator<E|null>) {
    super(instanceSourceId(`${elementLocator_}.dispatch`, InstanceofType<DispatchFn<V>>(Function)));
  }

  createWatcher(): Watcher<DispatchFn<V>|null> {
    return new ChainedWatcher<E|null, DispatchFn<V>|null>(
        this.elementLocator_.createWatcher(),
        (
            element,
            prevUnlisten,
            _,
            onChange) => startWatch_(element, prevUnlisten, onChange));
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
export class UnresolvedDispatcherLocator<V extends CustomEvent, E extends HTMLElement> extends
    UnresolvedWatchableLocator<DispatchFn<V>|null> {
  constructor(
      private readonly elementLocator_: UnresolvedWatchableLocator<E|null>) {
    super();
  }

  resolve(resolver: <S>(path: string, type: Type<S>) => S): ResolvedDispatcherLocator<V, E> {
    return new ResolvedDispatcherLocator(this.elementLocator_.resolve(resolver));
  }
}

type DispatcherLocator<V extends CustomEvent, E extends HTMLElement> =
    ResolvedDispatcherLocator<V, E>|UnresolvedDispatcherLocator<V, E>;

/**
 * Creates selector that selects the event dispatch function of an element.
 */
export function dispatcher<V extends CustomEvent, E extends HTMLElement>(
    elementLocator: UnresolvedWatchableLocator<HTMLElement|null>):
        UnresolvedDispatcherLocator<V, E>;
export function dispatcher<V extends CustomEvent, E extends HTMLElement>(
    elementLocator: ResolvedWatchableLocator<HTMLElement|null>): ResolvedDispatcherLocator<V, E>;
export function dispatcher<V extends CustomEvent, E extends HTMLElement>(
    elementLocator: UnresolvedWatchableLocator<E|null>| ResolvedWatchableLocator<E|null>):
        DispatcherLocator<V, E> {
  if (elementLocator instanceof ResolvedWatchableLocator) {
    return new ResolvedDispatcherLocator(elementLocator);
  } else {
    return new UnresolvedDispatcherLocator(elementLocator);
  }
}
