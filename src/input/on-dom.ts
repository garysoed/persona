import { InstanceStreamId, instanceStreamId } from 'grapevine/export/component';
import { InstanceofType } from 'gs-types/export';
import { fromEvent, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Input } from '../component/input';
import { UnresolvedElementProperty } from '../component/unresolved-element-property';

export class OnDomInput implements Input<Event> {
  readonly id: InstanceStreamId<Event>;

  constructor(
      private readonly eventName: string,
      private readonly options: AddEventListenerOptions,
      readonly resolver: (root: ShadowRoot) => Observable<Element>,
  ) {
    this.id = instanceStreamId(`onDom(${eventName})`, InstanceofType(Event));
  }

  getValue(root: ShadowRoot): Observable<Event> {
    return this.resolver(root)
        .pipe(switchMap(el => fromEvent(el, this.eventName, this.options)));
  }
}

class UnresolvedOnDomInput implements UnresolvedElementProperty<Element, OnDomInput> {
  constructor(
      private readonly eventName: string,
      private readonly options: AddEventListenerOptions,
  ) { }

  resolve(resolver: (root: ShadowRoot) => Observable<Element>): OnDomInput {
    return new OnDomInput(this.eventName, this.options, resolver);
  }
}

export function onDom(
    eventName: string,
    options: AddEventListenerOptions = {},
): UnresolvedOnDomInput {
  return new UnresolvedOnDomInput(eventName, options);
}
