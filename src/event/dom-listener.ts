import { VineImpl } from 'grapevine/export/main';
import { DisposableFunction } from 'gs-tools/export/dispose';
import { ResolvedWatchableLocator } from '../locator/resolved-locator';
import { CustomElementCtrl } from '../main/custom-element-ctrl';
import { BaseListener } from './base-listener';

/**
 * Class to listen to DOM events.
 */
export class DomListener<E extends HTMLElement|null = HTMLElement> extends BaseListener {
  constructor(
      private readonly elementLocator_: ResolvedWatchableLocator<E>,
      private readonly eventName_: string,
      propertyKey: string|symbol,
      private readonly options_?: AddEventListenerOptions) {
    super(propertyKey);
  }

  protected listenImpl_(
      vine: VineImpl,
      context: CustomElementCtrl,
      handler: EventListener): DisposableFunction {
    let lastEl: HTMLElement|null = null;
    const vineUnlisten = vine.listen(el => {
      if (el && lastEl !== el) {
        el.addEventListener(this.eventName_, handler, this.options_);
        lastEl = el;
      }

      if (!el && lastEl) {
        lastEl.removeEventListener(this.eventName_, handler, this.options_);
        lastEl = null;
      }
    }, context, this.elementLocator_.getReadingId());

    return DisposableFunction.of(() => {
      vineUnlisten();
      if (lastEl) {
        lastEl.removeEventListener(this.eventName_, handler, this.options_);
      }
    });
  }
}
