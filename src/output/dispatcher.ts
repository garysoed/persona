import { OperatorFunction, pipe } from 'rxjs';
import { map } from 'rxjs/operators';

import { Output } from '../types/output';
import { PersonaContext } from '../core/persona-context';
import { Resolver } from '../types/resolver';
import { UnresolvedElementProperty } from '../types/unresolved-element-property';
import { UnresolvedOutput } from '../types/unresolved-output';

import { CallerOutput } from './caller';


export type DispatchFn<E extends Event> = (event: E) => void;

export class DispatcherOutput<E extends Event> implements Output<E> {
  private readonly caller: CallerOutput<[E]>;

  constructor(
      readonly eventName: string,
      readonly resolver: Resolver<Element>,
  ) {
    this.caller = new CallerOutput(resolver, 'dispatchEvent');
  }

  output(context: PersonaContext): OperatorFunction<E, unknown> {
    return pipe(
        map(event => [event] as [E]),
        this.caller.output(context),
    );
  }
}

export class UnresolvedDispatcherOutput<E extends Event> implements
    UnresolvedElementProperty<Element, DispatcherOutput<E>>, UnresolvedOutput<E> {
  constructor(readonly eventName: string) { }

  resolve(resolver: Resolver<Element>): DispatcherOutput<E> {
    return new DispatcherOutput(this.eventName, resolver);
  }
}

export function dispatcher<E extends Event>(eventName: string): UnresolvedDispatcherOutput<E> {
  return new UnresolvedDispatcherOutput(eventName);
}
