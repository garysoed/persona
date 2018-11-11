import { VineImpl } from 'grapevine/export/main';
import { Errors } from 'gs-tools/export/error';
import { InstanceofType } from 'gs-types/export';
import { Observable, Subscription } from 'rxjs';
import { CustomElementCtrl } from '../main/custom-element-ctrl';

/**
 * Base class of all listeners.
 */
export abstract class BaseListener {
  constructor(private readonly propertyKey_: string|symbol) { }

  listen(vine: VineImpl, context: CustomElementCtrl): Subscription {
    const handlerFn = (context as any)[this.propertyKey_];
    if (!InstanceofType(Function).check(handlerFn)) {
      throw Errors.assert(`Property ${this.propertyKey_.toString()} of ${context}`)
          .shouldBeAnInstanceOf(Function)
          .butWas(handlerFn);
    }

    return this.listenImpl_(vine, context)
        .subscribe(event => {
          handlerFn.call(context, event, vine);
        });
  }

  protected abstract listenImpl_(vine: VineImpl, context: CustomElementCtrl): Observable<Event>;
}
