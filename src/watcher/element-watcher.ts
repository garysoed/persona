import { VineImpl } from 'grapevine/export/main';
import { BaseDisposable, DisposableFunction } from 'gs-tools/export/dispose';
import { Errors } from 'gs-tools/export/error';
import { ResolvedElementLocator } from '../locator/element-locator';
import { Watcher } from './watcher';

/**
 * Exposes HTMLElement in DOM to Typescript.
 */
export class ElementWatcher<T extends HTMLElement | null> extends Watcher<T> {
  constructor(
      private readonly locator_: ResolvedElementLocator<T>,
      vine: VineImpl) {
    super(locator_.getSourceId(), vine);
  }

  protected getValue_(root: ShadowRoot): T {
    const selectorString = this.locator_.getSelectorString();
    const type = this.locator_.getType();
    const el = root.querySelector(selectorString);
    if (!type.check(el)) {
      throw Errors.assert(`Element of [${selectorString}]`).shouldBeA(type).butWas(el);
    }

    return el;
  }

  watch(root: ShadowRoot, context: BaseDisposable): DisposableFunction {
    const mutationObserver = new MutationObserver(records => {
      if (records.length > 0) {
        this.updateVine_(root, context);
      }
    });
    mutationObserver.observe(root, {childList: true, subtree: true});

    this.updateVine_(root, context);

    return DisposableFunction.of(() => {
      mutationObserver.disconnect();
    });
  }
}
