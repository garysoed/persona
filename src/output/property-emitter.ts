import {OperatorFunction, pipe, ReplaySubject, Subject} from 'rxjs';
import {tap} from 'rxjs/operators';

import {ShadowContext} from '../core/shadow-context';
import {Output} from '../types/output';
import {Resolver} from '../types/resolver';
import {UnresolvedOutput} from '../types/unresolved-output';


type ObservableElement = Element & {[key: string]: Subject<unknown>};

export class PropertyEmitter<T> implements Output<T> {
  readonly type = 'out';

  constructor(
      readonly propertyName: string,
      readonly resolver: Resolver<Element>,
  ) { }

  output(context: ShadowContext): OperatorFunction<T, unknown> {
    return pipe(
        tap(value => {
          const element = this.resolver(context);
          const subject = (element as ObservableElement)[this.propertyName] ??
              new ReplaySubject<unknown>(1);
          subject.next(value);
          (element as ObservableElement)[this.propertyName] = subject;
        }),
    );
  }
}

export class UnresolvedPropertyEmitter<T> implements UnresolvedOutput<Element, T> {
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

