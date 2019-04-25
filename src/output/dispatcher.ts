import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Output } from '../types/output';
import { UnresolvedElementProperty } from '../types/unresolved-element-property';
import { CallerOutput } from './caller';

export type DispatchFn<E extends Event> = (event: E) => void;

export class DispatcherOutput<E extends Event> implements Output<E> {
  private readonly caller: CallerOutput<[E]>;

  constructor(
      readonly resolver: (root: ShadowRoot) => Observable<Element>,
  ) {
    this.caller = new CallerOutput(resolver, 'dispatchEvent');
  }

  output(root: ShadowRoot, valueObs: Observable<E>): Observable<unknown> {
    return this.caller.output(root, valueObs.pipe(map(event => [event] as [E])));
  }
}

export class UnresolvedDispatcherOutput<E extends Event> implements
    UnresolvedElementProperty<Element, DispatcherOutput<E>> {
  constructor(readonly eventName: string) { }

  resolve(resolver: (root: ShadowRoot) => Observable<Element>): DispatcherOutput<E> {
    return new DispatcherOutput(resolver);
  }
}

export function dispatcher<E extends Event>(eventName: string): UnresolvedDispatcherOutput<E> {
  return new UnresolvedDispatcherOutput(eventName);
}
