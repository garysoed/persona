import { combineLatest, concat, interval, Observable, OperatorFunction } from 'rxjs';
import { filter, map, shareReplay, startWith, switchMap, take, tap, withLatestFrom } from 'rxjs/operators';

import { PersonaContext } from '../core/persona-context';
import { Output } from '../types/output';
import { Resolver } from '../types/resolver';
import { UnresolvedElementProperty } from '../types/unresolved-element-property';
import { UnresolvedOutput } from '../types/unresolved-output';


type ElFunction<T extends readonly any[]> = (arg: T) => void;

const FUNCTION_CHECK_MS = 10;

export class CallerOutput<T extends readonly any[]> implements Output<T> {
  constructor(
      readonly resolver: Resolver<Element>,
      readonly functionName: string,
  ) { }

  output(context: PersonaContext): OperatorFunction<T, unknown> {
    const fn$ = createFnObs<T>(this.resolver(context), this.functionName);

    return value$ => {
      return concat(
          // Wait for the fn to exist.
          combineLatest([value$, fn$]).pipe(take(1)),
          value$.pipe(withLatestFrom(fn$)),
      )
      .pipe(
          tap(([value, fn]) => fn(value)),
      );
    };
  }
}

export class UnresolvedCallerOutput<T extends readonly any[]> implements
    UnresolvedElementProperty<Element, CallerOutput<T>>, UnresolvedOutput<T> {
  constructor(readonly functionName: string) { }

  resolve(resolver: Resolver<Element>): CallerOutput<T> {
    return new CallerOutput(resolver, this.functionName);
  }
}

export function caller<T extends readonly any[]>(functionName: string): UnresolvedCallerOutput<T> {
  return new UnresolvedCallerOutput(functionName);
}

function createFnObs<T extends readonly any[]>(
    elementObs: Observable<Element>,
    functionName: string,
): Observable<ElFunction<T>> {
  return elementObs
      .pipe(
          switchMap(el => {
            // Wait until the function exist.
            return interval(FUNCTION_CHECK_MS)
                .pipe(
                    startWith({}),
                    map(() => (el as any)[functionName]),
                    filter((fn): fn is Function => fn instanceof Function),
                    map(fn => ((args: readonly any[]) => fn.call(el, ...args))),
                    take(1),
                );
          }),
          shareReplay(1),
      );
}
