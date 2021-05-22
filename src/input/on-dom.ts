import {Observable, fromEvent} from 'rxjs';

import {ShadowContext} from '../core/shadow-context';
import {Input} from '../types/input';
import {Resolver} from '../types/resolver';
import {UnresolvedInput} from '../types/unresolved-input';


export class OnDomInput<E extends Event> implements Input<E> {
  constructor(
      readonly eventName: string,
      private readonly options: AddEventListenerOptions,
      readonly resolver: Resolver<Element>,
  ) { }

  getValue(context: ShadowContext): Observable<E> {
    const el = this.resolver(context);
    return fromEvent<E>(el, this.eventName, this.options);
  }
}

export class UnresolvedOnDomInput<E extends Event> implements UnresolvedInput<Element, E> {
  constructor(
      readonly eventName: string,
      private readonly options: AddEventListenerOptions,
  ) { }

  resolve(resolver: Resolver<Element>): OnDomInput<E> {
    return new OnDomInput(this.eventName, this.options, resolver);
  }
}

export function onDom<E extends Event>(
    eventName: string,
    options: AddEventListenerOptions = {},
): UnresolvedOnDomInput<E> {
  return new UnresolvedOnDomInput(eventName, options);
}
