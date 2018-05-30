import { VineImpl } from 'grapevine/export/main';
import { BaseDisposable, DisposableFunction } from 'gs-tools/export/dispose';
import { Errors } from 'gs-tools/export/error';
import { Event } from 'gs-tools/export/event';
import { Listener } from '../listener/listener';
import { ResolvedElementLocator } from '../locator/element-locator';
import { Watcher } from './watcher';

/**
 * Exposes HTMLElement in DOM to Typescript.
 */
export class ElementWatcher<T extends HTMLElement> extends Watcher<T> {
  constructor(
      private readonly locator_: ResolvedElementLocator<T>,
      vine: VineImpl) {
    super(vine);
  }

  private updateVine_(root: ShadowRoot, context: BaseDisposable): void {
    const selectorString = this.locator_.getSelectorString();
    const type = this.locator_.getType();
    const el = root.querySelector(selectorString);
    if (!type.check(el)) {
      throw Errors.assert(`Element of [${selectorString}]`).shouldBeA(type).butWas(el);
    }
    this.vine_.setValue(this.locator_.getSourceId(), el, context);
  }

  watch(root: ShadowRoot, context: BaseDisposable): DisposableFunction {
    const mutationObserver = new MutationObserver(records => {
      if (records.length > 0) {
        this.updateVine_(root, context);
      }
    });
    mutationObserver.observe(root, {childList: true});

    this.updateVine_(root, context);

    return DisposableFunction.of(() => {
      mutationObserver.disconnect();
    });
  }
}
