import { VineImpl } from 'grapevine/export/main';
import { fromEvent, Observable, of as observableOf } from 'rxjs';
import { switchMap } from 'rxjs/operators';
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
      private readonly options_: EventListenerOptions = {}) {
    super(propertyKey);
  }

  protected listenImpl_(
      vine: VineImpl,
      context: CustomElementCtrl): Observable<Event> {
    return vine.getObservable(this.elementLocator_.getReadingId(), context)
        .pipe(
            switchMap(el => {
              if (!el) {
                return observableOf();
              }

              return fromEvent(el as HTMLElement, this.eventName_, this.options_);
            }),
        );
  }
}
