import { VineImpl } from 'grapevine/export/main';
import { DisposableFunction } from 'gs-tools/export/dispose';
import { BooleanType } from 'gs-types/export';
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
export class KeydownListener<E extends HTMLElement|null = HTMLElement> extends DomListener<E> {
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
      context: CustomElementCtrl,
      handler: EventListener): DisposableFunction {
    return super.listenImpl_(vine, context, (event: Event) => {
      if (!(event instanceof KeyboardEvent)) {
        return;
      }

      if (event.key !== this.key_) {
        return;
      }

      if (BooleanType.check(this.matchOptions_.alt) && this.matchOptions_.alt !== event.altKey) {
        return;
      }

      if (BooleanType.check(this.matchOptions_.ctrl) && this.matchOptions_.ctrl !== event.ctrlKey) {
        return;
      }

      if (BooleanType.check(this.matchOptions_.meta) && this.matchOptions_.meta !== event.metaKey) {
        return;
      }

      if (BooleanType.check(this.matchOptions_.shift) &&
          this.matchOptions_.shift !== event.shiftKey) {
        return;
      }

      event.stopPropagation();
      handler(event);
    });
  }
}
