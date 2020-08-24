import { OperatorFunction, pipe, ReplaySubject, Subject } from 'rxjs';
import { tap, withLatestFrom } from 'rxjs/operators';

import { PersonaContext } from '../core/persona-context';
import { Output } from '../types/output';
import { Resolver } from '../types/resolver';
import { UnresolvedElementProperty } from '../types/unresolved-element-property';
import { UnresolvedOutput } from '../types/unresolved-output';


type ObservableElement = Element & {[key: string]: Subject<unknown>};

export class PropertyEmitter<T> implements Output<T> {
  constructor(
      readonly propertyName: string,
      readonly resolver: Resolver<Element>,
  ) { }

  output(context: PersonaContext): OperatorFunction<T, unknown> {
    return pipe(
        withLatestFrom(this.resolver(context)),
        tap(([value, element]) => {
          const subject = (element as ObservableElement)[this.propertyName] ||
              new ReplaySubject<unknown>(1);
          subject.next(value);
          (element as ObservableElement)[this.propertyName] = subject;
        }),
    );
  }
}

export class UnresolvedPropertyEmitter<T> implements
    UnresolvedElementProperty<Element, PropertyEmitter<T>>, UnresolvedOutput<T> {
  constructor(
      readonly propertyName: string,
  ) { }

  resolve(resolver: Resolver<Element>): PropertyEmitter<T> {
    return new PropertyEmitter(this.propertyName, resolver);
  }
}

export function emitter<T>(propertyName: string): UnresolvedPropertyEmitter<T> {
  return new UnresolvedPropertyEmitter(propertyName);
}
