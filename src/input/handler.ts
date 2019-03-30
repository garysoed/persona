import { InstanceStreamId, instanceStreamId } from '@grapevine/component';
import { AnyType, Type } from '@gs-types';
import { Observable, Subject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Input } from '../component/input';
import { UnresolvedElementProperty } from '../component/unresolved-element-property';

const __subject = Symbol('subject');

export class HandlerInput<T extends any[]> implements Input<T> {
  readonly id: InstanceStreamId<T>;

  constructor(
      readonly functionName: string,
      readonly resolver: (root: ShadowRoot) => Observable<Element>,
  ) {
    this.id = instanceStreamId(`fn(${functionName})`, AnyType<T>());
  }

  getValue(root: ShadowRoot): Observable<T> {
    return this.resolver(root)
        .pipe(
            switchMap(el => {
              const existingSubject = getSubject<T>(el, this.functionName);
              if (existingSubject) {
                return existingSubject;
              }

              const subject = new Subject<T>();
              const fn = Object.assign(
                  (...payload: T) => subject.next(payload),
                  {[__subject]: subject},
              );
              (el as any)[this.functionName] = fn;

              return subject;
            }),
        );
  }
}

export class UnresolvedHandlerInput<T extends any[]> implements
    UnresolvedElementProperty<Element, HandlerInput<T>> {
  constructor(
      readonly functionName: string,
  ) { }

  resolve(resolver: (root: ShadowRoot) => Observable<Element>): HandlerInput<T> {
    return new HandlerInput(this.functionName, resolver);
  }
}

export function handler<T extends any[]>(functionName: string): UnresolvedHandlerInput<T> {
  return new UnresolvedHandlerInput(functionName);
}

function getSubject<T>(el: any, functionName: string): Subject<T>|null {
  const existingFn = el[functionName];
  if (!(existingFn instanceof Function)) {
    return null;
  }

  const subject = existingFn[__subject];
  if (!(subject instanceof Subject)) {
    return null;
  }

  return subject;
}
