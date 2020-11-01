import { Observable, Subject, defer } from 'rxjs';

import { Input } from '../types/input';
import { PersonaContext } from '../core/persona-context';
import { Resolver } from '../types/resolver';
import { UnresolvedElementProperty } from '../types/unresolved-element-property';


const __subject = Symbol('subject');

type DecoratedElement = Element & Record<string, unknown>;

export class HandlerInput implements Input<readonly unknown[]> {
  constructor(
      readonly functionName: string,
      readonly resolver: Resolver<Element>,
  ) { }

  getValue(context: PersonaContext): Observable<readonly unknown[]> {
    return defer(() => {
      const el = this.resolver(context);
      const existingSubject = getSubject(el as DecoratedElement, this.functionName);
      if (existingSubject) {
        return existingSubject;
      }

      const subject = new Subject<readonly unknown[]>();
      const fn = Object.assign(
          (...payload: readonly unknown[]) => subject.next(payload),
          {[__subject]: subject},
      );
      (el as any)[this.functionName] = fn;

      return subject;
    });
  }
}

export class UnresolvedHandlerInput implements
    UnresolvedElementProperty<Element, HandlerInput> {
  constructor(
      readonly functionName: string,
  ) { }

  resolve(resolver: Resolver<Element>): HandlerInput {
    return new HandlerInput(this.functionName, resolver);
  }
}

export function handler(functionName: string): UnresolvedHandlerInput {
  return new UnresolvedHandlerInput(functionName);
}

export function getSubject(
    el: DecoratedElement,
    functionName: string,
): Subject<readonly unknown[]>|null {
  const existingFn = el[functionName];
  if (!(existingFn instanceof Function)) {
    return null;
  }

  const subject = (existingFn as any)[__subject];
  if (!(subject instanceof Subject)) {
    return null;
  }

  return subject;
}
