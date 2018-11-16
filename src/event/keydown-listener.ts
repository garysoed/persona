import { VineImpl } from 'grapevine/export/main';
import { BooleanType } from 'gs-types/export';
import { Observable } from 'rxjs';
import { filter, tap } from 'rxjs/operators';
import { ResolvedWatchableLocator } from '../locator/resolved-locator';
import { CustomElementCtrl } from '../main/custom-element-ctrl';
import { DomListener } from './dom-listener';

/**
 * Options for matching keydown event. Each entry has 3 values:
 *
 * -   `true`: REQUIRES the event to have this set.
 * -   `false`: REQUIRES the event to not have this set.
 * -   `undefined`: Ignores this field when matching.
 */
export interface MatchOptions {
  alt?: boolean;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
}

/**
 * Listens to keydown events, matching by key and several options.
 */
export class KeydownListener<E extends Element|null = Element> extends DomListener<E> {
  constructor(
      private readonly key_: string,
      private readonly matchOptions_: MatchOptions,
      elementLocator: ResolvedWatchableLocator<E>,
      propertyKey: string|symbol,
      options?: AddEventListenerOptions) {
    super(elementLocator, 'keydown', propertyKey, options);
  }

  protected listenImpl_(
      vine: VineImpl,
      context: CustomElementCtrl): Observable<Event> {
    return super.listenImpl_(vine, context)
        .pipe(
            filter(event => {
              if (!(event instanceof KeyboardEvent)) {
                return false;
              }

              if (event.key !== this.key_) {
                return false;
              }

              if (BooleanType.check(this.matchOptions_.alt) &&
                  this.matchOptions_.alt !== event.altKey) {
                return false;
              }

              if (BooleanType.check(this.matchOptions_.ctrl) &&
                  this.matchOptions_.ctrl !== event.ctrlKey) {
                return false;
              }

              if (BooleanType.check(this.matchOptions_.meta) &&
                  this.matchOptions_.meta !== event.metaKey) {
                return false;
              }

              if (BooleanType.check(this.matchOptions_.shift) &&
                  this.matchOptions_.shift !== event.shiftKey) {
                return false;
              }

              return true;
            }),
            tap(event => event.stopPropagation()),
        );
  }
}
