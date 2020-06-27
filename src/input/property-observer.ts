import { interval, Observable, ReplaySubject } from 'rxjs';
import { map, startWith, switchMap, take } from 'rxjs/operators';

import { PersonaContext } from '../core/persona-context';
import { Input } from '../types/input';
import { Resolver } from '../types/resolver';
import { UnresolvedElementProperty } from '../types/unresolved-element-property';


type ObservableElement<T> = Element & {[key: string]: Observable<T>};

export const CHECK_PERIOD_MS = 20;

export class PropertyObserver<T> implements Input<T> {
  constructor(
      readonly propertyName: string,
      readonly resolver: Resolver<Element>,
  ) { }

  getValue(context: PersonaContext): Observable<T> {
    return this.resolver(context).pipe(
        switchMap(element => {
          return interval(CHECK_PERIOD_MS).pipe(
              startWith({}),
              map(() => {
                const subject = (element as ObservableElement<T>)[this.propertyName] ||
                    new ReplaySubject<T>(1);
                (element as ObservableElement<T>)[this.propertyName] = subject;
                return subject;
              }),
              take(1),
              switchMap(obs => obs),
          );
        }),
    );
  }
}

export class UnresolvedPropertyObserver<T> implements
    UnresolvedElementProperty<Element, PropertyObserver<T>> {

  constructor(
      readonly propertyName: string,
  ) { }

  resolve(resolver: Resolver<Element>): PropertyObserver<T> {
    return new PropertyObserver(this.propertyName, resolver);
  }
}

export function observer<T>(propertyName: string): UnresolvedPropertyObserver<T> {
  return new UnresolvedPropertyObserver(propertyName);
}

