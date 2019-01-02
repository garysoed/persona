import { InstanceStreamId, instanceStreamId } from 'grapevine/export/component';
import { InstanceofType } from 'gs-types/export';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Input } from '../component/input';
import { UnresolvedElementProperty } from '../component/unresolved-element-property';

export type DispatchFn<E extends Event> = (event: E) => void;

export class DispatcherInput<E extends Event> implements Input<DispatchFn<E>> {
  readonly id: InstanceStreamId<DispatchFn<E>>;

  constructor(
      readonly resolver: (root: ShadowRoot) => Observable<Element>,
  ) {
    this.id = instanceStreamId(`dispatcher`, InstanceofType<DispatchFn<E>>(Function));
  }

  getValue(root: ShadowRoot): Observable<DispatchFn<E>> {
    return this.resolver(root)
        .pipe(map(el => (event: E) => el.dispatchEvent(event)));
  }
}

class UnresolvedDispatcherInput<E extends Event> implements
    UnresolvedElementProperty<Element, DispatcherInput<E>> {
  resolve(resolver: (root: ShadowRoot) => Observable<Element>): DispatcherInput<E> {
    return new DispatcherInput(resolver);
  }
}

export function dispatcher<E extends Event>(): UnresolvedDispatcherInput<E> {
  return new UnresolvedDispatcherInput();
}
