import {booleanType} from 'gs-types';
import {Observable} from 'rxjs';
import {filter, tap} from 'rxjs/operators';

import {ShadowContext} from '../core/shadow-context';
import {Resolver} from '../types/resolver';
import {UnresolvedInput} from '../types/unresolved-input';

import {OnDomInput} from './on-dom';


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

export class OnKeydownInput extends OnDomInput<KeyboardEvent> {
  constructor(
      private readonly key: string,
      private readonly matchOptions: MatchOptions,
      options: AddEventListenerOptions,
      readonly resolver: Resolver<Element>,
  ) {
    super('keydown', options, resolver);
  }

  getValue(context: ShadowContext): Observable<KeyboardEvent> {
    return super.getValue(context)
        .pipe(
            filter(event => {
              if (event.key !== this.key) {
                return false;
              }

              if (booleanType.check(this.matchOptions.alt)
                  && this.matchOptions.alt !== event.altKey) {
                return false;
              }

              if (booleanType.check(this.matchOptions.ctrl)
                  && this.matchOptions.ctrl !== event.ctrlKey) {
                return false;
              }

              if (booleanType.check(this.matchOptions.meta)
                  && this.matchOptions.meta !== event.metaKey) {
                return false;
              }

              if (booleanType.check(this.matchOptions.shift)
                  && this.matchOptions.shift !== event.shiftKey) {
                return false;
              }

              return true;
            }),
            tap(event => event.stopPropagation()),
        );
  }
}

export class UnresolvedOnKeydownInput implements UnresolvedInput<Element, KeyboardEvent> {
  constructor(
      private readonly key: string,
      private readonly matchOptions: MatchOptions,
      private readonly options: AddEventListenerOptions,
  ) { }

  resolve(resolver: Resolver<Element>): OnKeydownInput {
    return new OnKeydownInput(this.key, this.matchOptions, this.options, resolver);
  }
}

export function onKeydown(
    key: string,
    matchOptions: MatchOptions = {},
    options: AddEventListenerOptions = {},
): UnresolvedOnKeydownInput {
  return new UnresolvedOnKeydownInput(key, matchOptions, options);
}
