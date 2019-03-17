import { InstanceStreamId, instanceStreamId } from 'grapevine/export/component';
import { InstanceofType } from 'gs-types/export';
import { fromEvent, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Input } from '../component/input';
import { UnresolvedElementProperty } from '../component/unresolved-element-property';

export class OnDomInput<E extends Event> implements Input<E> {
  readonly id: InstanceStreamId<E>;

  constructor(
      private readonly eventName: string,
      private readonly options: AddEventListenerOptions,
      readonly resolver: (root: ShadowRoot) => Observable<Element>,
  ) {
    this.id = instanceStreamId(`onDom(${eventName})`, InstanceofType<E>(Event));
  }

  getValue(root: ShadowRoot): Observable<E> {
    return this.resolver(root)
        .pipe(switchMap(el => fromEvent<E>(el, this.eventName, this.options)));
  }
}

export class UnresolvedOnDomInput<E extends Event>
    implements UnresolvedElementProperty<Element, OnDomInput<E>> {
  constructor(
      private readonly eventName: string,
      private readonly options: AddEventListenerOptions,
  ) { }

  resolve(resolver: (root: ShadowRoot) => Observable<Element>): OnDomInput<E> {
    return new OnDomInput(this.eventName, this.options, resolver);
  }
}

export function onDom<E extends Event>(
    eventName: string,
    options: AddEventListenerOptions = {},
): UnresolvedOnDomInput<E> {
  return new UnresolvedOnDomInput(eventName, options);
}
