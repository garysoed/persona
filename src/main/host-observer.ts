import { filterByType } from 'gs-tools/export/rxjs';
import { instanceofType } from 'gs-types';
import { interval, Observable } from 'rxjs';
import { map, startWith, switchMap, take } from 'rxjs/operators';

import { PersonaContext } from '../core/persona-context';
import { Input } from '../types/input';


export const CHECK_INTERVAL_MS = 20;

export class HostObserver<T> implements Input<T> {
  constructor(
      private readonly propertyName: string,
  ) { }

  getValue(context: PersonaContext): Observable<T> {
    return interval(CHECK_INTERVAL_MS).pipe(
        startWith({}),
        map(() => (context.shadowRoot.host as any)[this.propertyName]),
        filterByType(instanceofType<Observable<T>>(Observable)),
        take(1),
        switchMap(obs => obs),
    );
  }
}

export function observer<T>(propertyName: string): HostObserver<T> {
  return new HostObserver(propertyName);
}

