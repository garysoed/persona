import { instanceSourceId } from 'grapevine/export/component';
import { VineImpl } from 'grapevine/export/main';
import { cache } from 'gs-tools/export/data';
import { DisposableFunction } from 'gs-tools/export/dispose';
import { Errors } from 'gs-tools/src/error';
import { InstanceofType } from 'gs-types/export';
import { Handler, Watcher } from '../watcher/watcher';
import { ResolvedWatchableLocator } from './resolved-locator';

/**
 * Watch for changes to the shadow host.
 */
class ShadowHostWatcher extends Watcher<HTMLElement> {
  getValue_(root: ShadowRoot): HTMLElement {
    return root.host as HTMLElement;
  }

  protected startWatching_(
      _vineImpl: VineImpl,
      onChange: Handler<HTMLElement>,
      root: ShadowRoot): DisposableFunction {
    onChange(root.host as HTMLElement);

    return DisposableFunction.of(() => undefined);
  }
}

/**
 * Locates the shadow host.
 */
class ShadowHostLocatorImpl extends ResolvedWatchableLocator<HTMLElement> {
  constructor() {
    super(instanceSourceId('.host', InstanceofType(HTMLElement)));
  }

  @cache()
  createWatcher(): Watcher<HTMLElement> {
    return new ShadowHostWatcher();
  }

  getValue(root: ShadowRoot): HTMLElement {
    const host = root.host;
    if (!(host instanceof HTMLElement)) {
      throw Errors.assert('host element').shouldBeAnInstanceOf(HTMLElement).butWas(host);
    }

    return host;
  }

  toString(): string {
    return ':host';
  }
}

export const shadowHost = new ShadowHostLocatorImpl();
