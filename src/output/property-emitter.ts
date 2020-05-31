import { OperatorFunction, pipe, Subject } from 'rxjs';
import { tap, withLatestFrom } from 'rxjs/operators';

import { PersonaContext } from '../core/persona-context';
import { Output } from '../types/output';
import { Resolver } from '../types/resolver';
import { UnresolvedElementProperty } from '../types/unresolved-element-property';


type ObservableElement = Element & {readonly [key: string]: unknown};

export class PropertyEmitter<T> implements Output<T> {
  constructor(
      readonly propertyName: string,
      readonly resolver: Resolver<Element>,
  ) { }

  output(context: PersonaContext): OperatorFunction<T, unknown> {
    return pipe(
        withLatestFrom(this.resolver(context)),
        tap(([value, element]) => {
          const subject = (element as ObservableElement)[this.propertyName];
          if (!(subject instanceof Subject)) {
            throw new Error(`Property ${this.propertyName} has no emitter`);
          }

          subject.next(value);
        }),
    );
  }
}

export class UnresolvedPropertyEmitter<T> implements
    UnresolvedElementProperty<Element, PropertyEmitter<T>> {
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

