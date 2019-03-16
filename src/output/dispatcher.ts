import { InstanceStreamId, instanceStreamId } from 'grapevine/export/component';
import { InstanceofType } from 'gs-types/export';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Output } from '../component/output';
import { UnresolvedElementProperty } from '../component/unresolved-element-property';
import { CallerOutput } from './caller';

export type DispatchFn<E extends Event> = (event: E) => void;

export class DispatcherOutput<E extends Event> implements Output<E> {
  readonly id: InstanceStreamId<DispatchFn<E>>;
  private readonly caller: CallerOutput<[E]>;

  constructor(
      readonly resolver: (root: ShadowRoot) => Observable<Element>,
  ) {
    this.id = instanceStreamId(`dispatcher`, InstanceofType<DispatchFn<E>>(Function));
    this.caller = new CallerOutput(resolver, 'dispatchEvent');
  }

  getValue(root: ShadowRoot): Observable<DispatchFn<E>> {
    return this.resolver(root)
        .pipe(map(el => (event: E) => el.dispatchEvent(event)));
  }

  output(root: ShadowRoot, valueObs: Observable<E>): Observable<unknown> {
    return this.caller.output(root, valueObs.pipe(map(event => [event] as [E])));
  }
}

class UnresolvedDispatcherOutput<E extends Event> implements
    UnresolvedElementProperty<Element, DispatcherOutput<E>> {
  resolve(resolver: (root: ShadowRoot) => Observable<Element>): DispatcherOutput<E> {
    return new DispatcherOutput(resolver);
  }
}

export function dispatcher<E extends Event>(): UnresolvedDispatcherOutput<E> {
  return new UnresolvedDispatcherOutput();
}
