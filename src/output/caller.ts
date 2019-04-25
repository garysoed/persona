import { combineLatest, interval, Observable } from 'rxjs';
import { distinctUntilChanged, filter, map, shareReplay, switchMap, take, tap } from 'rxjs/operators';
import { Output } from '../types/output';
import { UnresolvedElementProperty } from '../types/unresolved-element-property';

type ElFunction<T extends any[]> = (arg: T) => void;

const FUNCTION_CHECK_MS = 10;

export class CallerOutput<T extends any[]> implements Output<T> {
  constructor(
      readonly resolver: (root: ShadowRoot) => Observable<Element>,
      readonly functionName: string,
  ) { }

  output(root: ShadowRoot, valueObs: Observable<T>): Observable<unknown> {
    return combineLatest(
        valueObs,
        createFnObs<T>(this.resolver(root), this.functionName),
    )
        .pipe(
            distinctUntilChanged((prev, next) => prev[0] !== next[0]),
            tap(([value, fn]) => fn(value)),
        );
  }
}

export class UnresolvedCallerOutput<T extends any[]> implements
    UnresolvedElementProperty<Element, CallerOutput<T>> {
  constructor(readonly functionName: string) { }

  resolve(resolver: (root: ShadowRoot) => Observable<Element>): CallerOutput<T> {
    return new CallerOutput(resolver, this.functionName);
  }
}

export function caller<T extends any[]>(functionName: string): UnresolvedCallerOutput<T> {
  return new UnresolvedCallerOutput(functionName);
}

function createFnObs<T extends any[]>(
    elementObs: Observable<Element>,
    functionName: string,
): Observable<ElFunction<T>> {
  return elementObs
      .pipe(
          switchMap(el => {
            // Wait until the function exist.
            return interval(FUNCTION_CHECK_MS)
                .pipe(
                    map(() => (el as any)[functionName]),
                    filter((fn): fn is Function => fn instanceof Function),
                    map(fn => ((args: any[]) => fn.call(el, ...args))),
                    take(1),
                );
          }),
          shareReplay(1),
      );
}
