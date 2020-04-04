import { OperatorFunction, pipe } from 'rxjs';
import { map } from 'rxjs/operators';

import { Output } from '../types/output';
import { Resolver } from '../types/resolver';
import { ShadowRootLike } from '../types/shadow-root-like';
import { UnresolvedElementProperty } from '../types/unresolved-element-property';

import { CallerOutput } from './caller';

export type DispatchFn<E extends Event> = (event: E) => void;

export class DispatcherOutput<E extends Event> implements Output<E> {
  private readonly caller: CallerOutput<[E]>;

  constructor(
      readonly resolver: Resolver<Element>,
  ) {
    this.caller = new CallerOutput(resolver, 'dispatchEvent');
  }

  output(root: ShadowRootLike): OperatorFunction<E, unknown> {
    return pipe(
        map(event => [event] as [E]),
        this.caller.output(root),
    );
  }
}

export class UnresolvedDispatcherOutput<E extends Event> implements
    UnresolvedElementProperty<Element, DispatcherOutput<E>> {
  constructor(readonly eventName: string) { }

  resolve(resolver: Resolver<Element>): DispatcherOutput<E> {
    return new DispatcherOutput(resolver);
  }
}

export function dispatcher<E extends Event>(eventName: string): UnresolvedDispatcherOutput<E> {
  return new UnresolvedDispatcherOutput(eventName);
}
