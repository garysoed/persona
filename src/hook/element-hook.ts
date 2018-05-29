import { VineImpl } from 'grapevine/export/main';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { Errors } from 'gs-tools/export/error';
import { ResolvedElementLocator } from '../locator/element-locator';
import { Hook } from './hook';

/**
 * Exposes HTMLElement in DOM to Typescript.
 */
export class ElementHook<T extends HTMLElement> extends Hook {
  constructor(
      private readonly locator_: ResolvedElementLocator<T>,
      vine: VineImpl) {
    super(vine);
  }

  install(root: ShadowRoot, component: BaseDisposable): void {
    const selectorString = this.locator_.getSelectorString();
    const type = this.locator_.getType();
    const el = root.querySelector(selectorString);
    if (!type.check(el)) {
      throw Errors.assert(`Element of [${selectorString}]`).shouldBeA(type).butWas(el);
    }

    this.vine_.setValue(this.locator_.getSourceId(), el, component);
  }
}
