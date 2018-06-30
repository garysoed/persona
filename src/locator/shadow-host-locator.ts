import { instanceSourceId } from 'grapevine/export/component';
import { VineImpl } from 'grapevine/export/main';
import { BaseDisposable, DisposableFunction } from 'gs-tools/export/dispose';
import { Errors } from 'gs-tools/src/error';
import { InstanceofType } from 'gs-types/export';
import { Watcher } from '../watcher/watcher';
import { ResolvedWatchableLocator } from './resolved-locator';

/**
 * Watch for changes to the shadow host.
 */
class ShadowHostWatcher extends Watcher<HTMLElement> {
  watch(root: ShadowRoot, context: BaseDisposable): DisposableFunction {
    this.vine_.setValue(this.sourceId_, root.host as HTMLElement, context);

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

  createWatcher(vine: VineImpl): Watcher<HTMLElement> {
    return new ShadowHostWatcher(this.getSourceId(), vine);
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
