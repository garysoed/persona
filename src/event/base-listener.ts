import { VineImpl } from 'grapevine/export/main';
import { DisposableFunction } from 'gs-tools/export/dispose';
import { Errors } from 'gs-tools/export/error';
import { InstanceofType } from 'gs-types/export';
import { CustomElementCtrl } from '../main/custom-element-ctrl';

/**
 * Base class of all listeners.
 */
export abstract class BaseListener {
  constructor(private readonly propertyKey_: string|symbol) { }

  listen(vine: VineImpl, context: CustomElementCtrl): DisposableFunction {
    const handlerFn = (context as any)[this.propertyKey_];
    if (!InstanceofType(Function).check(handlerFn)) {
      throw Errors.assert(`Property ${this.propertyKey_.toString()} of ${context}`)
          .shouldBeAnInstanceOf(Function)
          .butWas(handlerFn);
    }

    return this.listenImpl_(vine, context, (event: Event) => handlerFn.call(context, event, vine));
  }

  protected abstract listenImpl_(
      vine: VineImpl,
      context: CustomElementCtrl,
      handler: EventListener): DisposableFunction;
}
