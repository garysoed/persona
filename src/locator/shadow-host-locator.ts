import { instanceSourceId } from 'grapevine/export/component';
import { VineImpl } from 'grapevine/export/main';
import { cache } from 'gs-tools/export/data';
import { DisposableFunction } from 'gs-tools/export/dispose';
import { Errors } from 'gs-tools/src/error';
import { InstanceofType } from 'gs-types/export';
import { Observable, of as observableOf } from 'rxjs';
import { Handler, Watcher } from '../watcher/watcher';
import { ResolvedWatchableLocator } from './resolved-locator';

/**
 * Watch for changes to the shadow host.
 */
class ShadowHostWatcher extends Watcher<HTMLElement> {
  getValue(root: ShadowRoot): HTMLElement {
    return root.host as HTMLElement;
  }

  protected startWatching_(
      _vineImpl: VineImpl,
      onChange: Handler,
      root: ShadowRoot): DisposableFunction {
    onChange(root);

    return DisposableFunction.of(() => undefined);
  }
}

/**
 * Locates the shadow host.
 */
class ShadowHostLocatorImpl extends ResolvedWatchableLocator<Element> {
  constructor() {
    super(instanceSourceId('.host', InstanceofType(HTMLElement)));
  }

  @cache()
  getObservableValue(root: ShadowRoot): Observable<Element> {
    const host = root.host;
    if (!host) {
      throw Errors.assert(`Host for ${root}`).shouldExist().butNot();
    }

    return observableOf(host);
  }

  getValue(root: ShadowRoot): Element {
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
