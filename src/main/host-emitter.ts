import { defer, of as observableOf, OperatorFunction, pipe, Subject } from 'rxjs';
import { tap, withLatestFrom } from 'rxjs/operators';

import { PersonaContext } from '../core/persona-context';
import { Output } from '../types/output';

export class HostEmitter<T> implements Output<T> {
  constructor(
      private readonly propertyName: string,
      private readonly subjectFactory: () => Subject<T>,
  ) { }

  output(context: PersonaContext): OperatorFunction<T, unknown> {
    const subject$ = defer(() => {
      const hostEl = context.shadowRoot.host;
      const existingSubject = (hostEl as any)[this.propertyName];
      if (existingSubject instanceof Subject) {
        return observableOf(existingSubject);
      }

      const subject = this.subjectFactory();
      Object.assign(hostEl, {[this.propertyName]: subject});
      return observableOf(subject);
    });
    return pipe(
        withLatestFrom(subject$),
        tap(([value, subject]) => {
          subject.next(value);
        }),
    );
  }
}

export function emitter<T>(propertyName: string, subjectFactory: () => Subject<T>): HostEmitter<T> {
  return new HostEmitter(propertyName, subjectFactory);
}

