import { instanceSourceId } from 'grapevine/export/component';
import { VineImpl } from 'grapevine/export/main';
import { BaseDisposable, DisposableFunction } from 'gs-tools/export/dispose';
import { InstanceofType, NullableType } from 'gs-types/export';
import { Watcher } from '../watcher/watcher';
import { ResolvedLocator } from './locator';

/**
 * Watch for changes to the shadow host.
 */
class ShadowHostWatcher extends Watcher<HTMLElement|null> {
  watch(root: ShadowRoot, context: BaseDisposable): DisposableFunction {
    this.vine_.setValue(this.sourceId_, root.host as HTMLElement, context);

    return DisposableFunction.of(() => undefined);
  }
}

/**
 * Locates the shadow host.
 */
class ShadowHostLocatorImpl extends ResolvedLocator<HTMLElement|null> {
  constructor() {
    super(instanceSourceId('.host', NullableType(InstanceofType(HTMLElement))));
  }

  createWatcher(vine: VineImpl): Watcher<HTMLElement|null> {
    return new ShadowHostWatcher(this.sourceId_, vine);
  }

  toString(): string {
    return ':host';
  }
}

export const shadowHost = new ShadowHostLocatorImpl();
