import { filterByType } from 'gs-tools/export/rxjs';
import { instanceofType } from 'gs-types';
import { interval, Observable } from 'rxjs';
import { map, startWith, switchMap, take } from 'rxjs/operators';

import { PersonaContext } from '../core/persona-context';
import { Input } from '../types/input';
import { Resolver } from '../types/resolver';
import { UnresolvedElementProperty } from '../types/unresolved-element-property';


type ObservableElement = Element & {readonly [key: string]: Observable<unknown>};

const CHECK_PERIOD_MS = 20;

export class PropertyObserver implements Input<unknown> {
  constructor(
      readonly propertyName: string,
      readonly resolver: Resolver<Element>,
  ) { }

  getValue(context: PersonaContext): Observable<unknown> {
    return this.resolver(context).pipe(
        switchMap(element => {
          return interval(CHECK_PERIOD_MS).pipe(
              startWith({}),
              map(() => (element as ObservableElement)[this.propertyName]),
              filterByType(instanceofType(Observable)),
              take(1),
              switchMap(obs => obs),
          );
        }),
    );
  }
}

export class UnresolvedPropertyObserver implements
    UnresolvedElementProperty<Element, PropertyObserver> {

  constructor(
      readonly propertyName: string,
  ) { }

  resolve(resolver: Resolver<Element>): PropertyObserver {
    return new PropertyObserver(this.propertyName, resolver);
  }
}

export function observer(propertyName: string): UnresolvedPropertyObserver {
  return new UnresolvedPropertyObserver(propertyName);
}

