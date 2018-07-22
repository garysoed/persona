import { VineImpl } from 'grapevine/export/main';
import { DisposableFunction } from 'gs-tools/export/dispose';
import { Errors } from 'gs-tools/src/error';
import { InstanceofType } from 'gs-types/export';
import { ResolvedWatchableLocator } from '../locator/resolved-locator';
import { CustomElementCtrl } from '../main/custom-element-ctrl';

/**
 * Class to listen to DOM events.
 */
export class DomListener {
  constructor(
      private readonly elementLocator_: ResolvedWatchableLocator<HTMLElement|null>,
      private readonly eventName_: string,
      private readonly propertyKey_: string|symbol,
      private readonly options_?: AddEventListenerOptions) { }

  listen(vine: VineImpl, context: CustomElementCtrl): DisposableFunction {
    let lastEl: HTMLElement|null = null;
    const handlerFn = (context as any)[this.propertyKey_];
    if (!InstanceofType(Function).check(handlerFn)) {
      throw Errors.assert(`Property ${this.propertyKey_.toString()} of ${context}`)
          .shouldBeAnInstanceOf(Function)
          .butWas(handlerFn);
    }

    const handler = (event: Event) => handlerFn.call(context, event, vine);
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
