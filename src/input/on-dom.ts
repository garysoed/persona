import { PersonaContext } from 'export';
import { fromEvent, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { PersonaContext } from '../core/persona-context';
import { Input } from '../types/input';
import { Resolver } from '../types/resolver';
import { UnresolvedElementProperty } from '../types/unresolved-element-property';


export class OnDomInput<E extends Event> implements Input<E> {
  constructor(
      readonly eventName: string,
      private readonly options: AddEventListenerOptions,
      readonly resolver: Resolver<Element>,
  ) { }

  getValue(context: PersonaContext): Observable<E> {
    return this.resolver(context)
        .pipe(switchMap(el => fromEvent<E>(el, this.eventName, this.options)));
  }
}

export class UnresolvedOnDomInput<E extends Event>
    implements UnresolvedElementProperty<Element, OnDomInput<E>> {
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
